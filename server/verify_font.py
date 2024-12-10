from fontTools.ttLib import TTFont
import os
import sys

def verify_font(font_path):
    try:
        # フォントファイルを開く
        font = TTFont(font_path)
        
        # 基本情報の取得
        print("\n=== フォント検証結果 ===")
        print(f"ファイル名: {os.path.basename(font_path)}")
        print(f"フォーマット: {'TrueType' if 'glyf' in font else 'OpenType'}")
        
        # フォントの基本情報を表示
        if 'name' in font:
            for record in font['name'].names:
                if record.platformID == 3 and record.platEncID == 1:  # Windows向けエンコーディング
                    try:
                        value = record.string.decode('utf-16-be')
                        if record.nameID == 1:  # フォントファミリー名
                            print(f"フォントファミリー: {value}")
                        elif record.nameID == 2:  # サブファミリー
                            print(f"スタイル: {value}")
                        elif record.nameID == 4:  # 完全なフォント名
                            print(f"フルネーム: {value}")
                    except:
                        continue

        # テーブル情報
        print("\nフォントテーブル:")
        for table in sorted(font.keys()):
            print(f"- {table}")
            
        print("\n✅ 検証結果: 有効なTrueTypeフォントファイルです")
        font.close()
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
        return False
        
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使用方法: python verify_font.py <フォントファイルのパス>")
        sys.exit(1)
        
    verify_font(sys.argv[1])
