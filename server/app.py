from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from fontTools.ttLib import TTFont
import os
from werkzeug.utils import secure_filename
import tempfile
import traceback
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'otf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def verify_font(font_path):
    try:
        font = TTFont(font_path)
        verification = {
            "filename": os.path.basename(font_path),
            "format": 'TrueType' if 'glyf' in font else 'OpenType',
            "tables": sorted(font.keys()),
            "details": {}
        }

        if 'name' in font:
            for record in font['name'].names:
                if record.platformID == 3 and record.platEncID == 1:
                    try:
                        value = record.string.decode('utf-16-be')
                        if record.nameID == 1:
                            verification["details"]["family"] = value
                        elif record.nameID == 2:
                            verification["details"]["style"] = value
                        elif record.nameID == 4:
                            verification["details"]["fullname"] = value
                    except:
                        continue

        font.close()
        return verification
    except Exception as e:
        print(f"Font verification error: {str(e)}")
        return None

@app.route('/convert', methods=['POST'])
def convert_font():
    if 'font' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['font']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only .otf files are allowed'}), 400

    try:
        # Save uploaded file
        input_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
        file.save(input_path)
        
        # Create output path
        output_filename = os.path.splitext(secure_filename(file.filename))[0] + '.ttf'
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)
        
        # Convert font
        font = TTFont(input_path)
        font.save(output_path)
        font.close()

        # Verify the converted font
        verification_result = verify_font(output_path)
        
        # Read the converted file
        with open(output_path, 'rb') as f:
            file_data = f.read()

        # Clean up files
        os.remove(input_path)
        os.remove(output_path)

        # Create response with both file and verification data
        response = app.response_class(
            response=file_data,
            status=200,
            mimetype='application/x-font-ttf'
        )
        
        # Add verification data as a custom header
        response.headers['X-Font-Verification'] = json.dumps(verification_result)
        response.headers['Content-Disposition'] = f'attachment; filename={output_filename}'
        
        return response

    except Exception as e:
        print(f"Conversion error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': 'Font conversion failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)
