#!/usr/bin/env python3
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path


WEB = Path(__file__).resolve().parents[1]
ROOT = WEB.parent
DATA = WEB / "data" / "site-data.js"
OUT_ROOT = WEB / "assets" / "media" / "optimized"

SECTION_FOLDERS = {
    "edicion-generacion-ia": "01-edicion-video-generacion-ia",
    "generacion-imagenes-ia": "02-generacion-imagenes-ia",
    "generacion-video-ia": "03-generacion-video-ia",
    "edicion-video": "04-edicion-video",
}

PROJECT_FOLDERS = {
    "Alfajor GOAT": "alfajor-goat",
    "Animatic Santa Fe": "animatic-santa-fe",
    "Arcor Halloween": "arcor-halloween",
    "Arcor Navidad": "arcor-navidad",
    "Arcor Pascuas": "arcor-pascuas",
    "Cofler Cups": "cofler-cups",
    "Animatic Imperial": "animatic-imperial",
    "Animatic Seguros": "animatic-seguros",
    "Semana de la Dulzura": "semana-de-la-dulzura",
    "PNT Perro": "pnt-perro",
    "Pizza Para Ocho": "pizza-para-ocho",
    "Coppel Mexico": "coppel-mexico",
    "Storyboard Prosegur": "storyboard-prosegur",
    "BNA Mundial": "bna-mundial",
    "Colecciones La Nacion": "colecciones-la-nacion",
    "Hamlet": "hamlet",
    "Arcor Cofler Obleas Max": "arcor-cofler-obleas-max",
    "Cofler Dulce de Leche": "cofler-dulce-de-leche",
    "T-Mobile / Bad Bunny": "t-mobile-bad-bunny",
    "Canilla": "canilla",
    "Pinguino": "pinguino",
    "Recap Viudas Negras": "recap-viudas-negras",
}


def load_data():
    raw = DATA.read_text(encoding="utf-8")
    raw = re.sub(r"^window\.PORTFOLIO_DATA\s*=\s*", "", raw).strip().rstrip(";")
    return json.loads(raw)


def slug(value):
    value = value.lower()
    replacements = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ñ": "n",
        "ü": "u",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "pieza"


def output_name(piece, project, used_names):
    if len(project["pieces"]) == 1:
        base = "principal"
    else:
        base = slug(piece["title"])
    if base in {"version-principal", "pieza-principal"}:
        base = "principal"

    original = base
    suffix = 2
    while base in used_names:
        base = f"{original}-{suffix}"
        suffix += 1
    used_names.add(base)
    return base


def iter_jobs(selected_project=None, selected_type=None):
    data = load_data()
    for section in data["sections"]:
        section_folder = SECTION_FOLDERS[section["slug"]]
        for project in section["projects"]:
            if selected_project and slug(project["title"]) != selected_project:
                continue
            project_folder = PROJECT_FOLDERS[project["title"]]
            used_names = set()
            for piece in project["pieces"]:
                if selected_type and piece["type"] != selected_type:
                    continue
                source = ROOT / piece["path"]
                media_type = piece["type"]
                extension = ".mp4" if media_type == "video" else ".webp"
                name = output_name(piece, project, used_names)
                target = OUT_ROOT / section_folder / project_folder / f"{name}{extension}"
                yield {
                    "section": section["title"],
                    "project": project["title"],
                    "piece": piece["title"],
                    "type": media_type,
                    "source": source,
                    "target": target,
                    "size_mb": piece.get("sizeMb", 0),
                }


def video_command(source, target, crf, max_side, max_fps):
    scale = (
        f"scale='if(gte(iw,ih),min({max_side},iw),-2)':"
        f"'if(gte(iw,ih),-2,min({max_side},ih))'"
    )
    filters = f"{scale},fps={max_fps}"
    return [
        "ffmpeg",
        "-y",
        "-i",
        str(source),
        "-vf",
        filters,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        str(crf),
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(target),
    ]


def image_command(source, target, quality, max_side):
    return [
        "magick",
        str(source),
        "-auto-orient",
        "-resize",
        f"{max_side}x{max_side}>",
        "-strip",
        "-quality",
        str(quality),
        str(target),
    ]


def ensure_tools():
    missing = []
    if not shutil.which("ffmpeg"):
        missing.append("ffmpeg")
    if not shutil.which("magick"):
        missing.append("ImageMagick/magick")
    if missing:
        raise SystemExit("Faltan herramientas: " + ", ".join(missing))


def human_size(path):
    if not path.exists():
        return "-"
    size = path.stat().st_size / (1024 * 1024)
    return f"{size:.1f} MB"


def main():
    parser = argparse.ArgumentParser(description="Comprime los medios del portfolio para publicar en web.")
    parser.add_argument("--run", action="store_true", help="Ejecuta la compresion. Sin esto solo muestra una simulacion.")
    parser.add_argument("--overwrite", action="store_true", help="Vuelve a generar archivos aunque ya existan.")
    parser.add_argument("--only-project", help="Procesa un proyecto por slug. Ej: coppel-mexico, bna-mundial.")
    parser.add_argument("--only-type", choices=["video", "image"], help="Procesa solo videos o solo imagenes.")
    parser.add_argument("--limit", type=int, help="Procesa solo los primeros N archivos.")
    parser.add_argument("--video-crf", type=int, default=27, help="Calidad video. Menor numero = mas calidad/peso.")
    parser.add_argument("--video-max-side", type=int, default=1920, help="Lado maximo para videos.")
    parser.add_argument("--video-max-fps", type=int, default=30, help="FPS maximo para videos.")
    parser.add_argument("--image-quality", type=int, default=82, help="Calidad WebP/JPG.")
    parser.add_argument("--image-max-side", type=int, default=2400, help="Lado maximo para imagenes.")
    args = parser.parse_args()

    if args.run:
        ensure_tools()

    jobs = list(iter_jobs(args.only_project, args.only_type))
    if args.limit:
        jobs = jobs[: args.limit]

    print(f"Destino: {OUT_ROOT.relative_to(ROOT)}")
    print(f"Archivos a revisar: {len(jobs)}")
    print("Modo:", "COMPRIMIR" if args.run else "SIMULACION")
    print()

    processed = 0
    skipped = 0
    missing = 0

    for job in jobs:
        source = job["source"]
        target = job["target"]
        label = f"{job['section']} / {job['project']} / {job['piece']}"

        if not source.exists():
            missing += 1
            print(f"FALTA: {label}")
            print(f"  origen: {source}")
            continue

        if target.exists() and not args.overwrite:
            skipped += 1
            print(f"OK EXISTE: {label}")
            print(f"  destino: {target.relative_to(ROOT)} ({human_size(target)})")
            continue

        print(f"GENERAR: {label}")
        print(f"  origen: {source.relative_to(ROOT)} ({human_size(source)})")
        print(f"  destino: {target.relative_to(ROOT)}")

        if not args.run:
            continue

        target.parent.mkdir(parents=True, exist_ok=True)
        if job["type"] == "video":
            command = video_command(source, target, args.video_crf, args.video_max_side, args.video_max_fps)
        else:
            command = image_command(source, target, args.image_quality, args.image_max_side)
        subprocess.run(command, check=True)
        processed += 1
        print(f"  listo: {human_size(target)}")

    print()
    print(f"Generados: {processed}")
    print(f"Saltados existentes: {skipped}")
    print(f"Faltantes: {missing}")
    if not args.run:
        print("Para ejecutar realmente, repetir con --run.")


if __name__ == "__main__":
    main()
