# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow"]
# ///

import argparse
from pathlib import Path
from PIL import Image

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp"}


def convert_to_webp(
    input_path: Path, output_path: Path | None = None, quality: int = 85
) -> Path:
    img = Image.open(input_path)

    if output_path is None:
        output_path = input_path.with_suffix(".webp")

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")

    img.save(output_path, "webp", quality=quality)
    img.close()

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Convert images to webp format")
    parser.add_argument("input", type=Path, help="Input file or directory")
    parser.add_argument("-o", "--output", type=Path, help="Output file or directory")
    parser.add_argument(
        "-q", "--quality", type=int, default=85, help="WebP quality (1-100)"
    )
    parser.add_argument(
        "-r", "--recursive", action="store_true", help="Process directories recursively"
    )
    parser.add_argument(
        "--delete", action="store_true", help="Delete original files after conversion"
    )
    args = parser.parse_args()

    input_path = args.input

    if input_path.is_file():
        output_path = args.output
        result = convert_to_webp(input_path, output_path, args.quality)
        print(f"Converted: {input_path} -> {result}")
        if args.delete and input_path != result:
            input_path.unlink()
            print(f"Deleted: {input_path}")

    elif input_path.is_dir():
        output_dir = args.output or input_path
        output_dir.mkdir(parents=True, exist_ok=True)

        pattern = "**/*" if args.recursive else "*"
        for file_path in input_path.glob(pattern):
            if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                if args.recursive:
                    rel_path = file_path.relative_to(input_path)
                    out_path = output_dir / rel_path.with_suffix(".webp")
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                else:
                    out_path = output_dir / file_path.with_suffix(".webp")

                result = convert_to_webp(file_path, out_path, args.quality)
                print(f"Converted: {file_path} -> {result}")
                if args.delete and file_path != result:
                    file_path.unlink()
                    print(f"Deleted: {file_path}")
    else:
        print(f"Error: {input_path} not found")
        exit(1)


if __name__ == "__main__":
    main()
