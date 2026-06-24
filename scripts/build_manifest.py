#!/usr/bin/env python3
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "portfolio-web"
DATA = WEB / "data"
PREVIEWS = WEB / "assets" / "previews"
POSTERS = WEB / "assets" / "posters"

VIDEO_EXTS = {".mp4", ".mov"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
SKIP_NAMES = {".ds_store"}


def slugify(value):
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "asset"


def clean_title(path):
    stem = path.stem
    stem = re.sub(r"[_-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem)
    return stem.strip()


def rel(path):
    return os.path.relpath(path, WEB).replace(os.sep, "/")


def web_ref(path):
    return rel(path)


def original_ref(path):
    return rel(path)


def section_for(parts):
    first = parts[0] if parts else ""
    joined = "/".join(parts).lower()
    if first == "A - Edicion":
        return "Edicion"
    if "storyboard prosegur" in joined:
        return "Storyboards e imagenes"
    if "coppel mexico" in joined:
        return "Storyboards e imagenes"
    if first == "A - Generacion":
        return "Generacion"
    if first == "A - Generacion y Edicion":
        return "Generacion y edicion"
    return "Archivo"


def client_for(parts, filename):
    text = " / ".join(parts + [filename]).lower()
    checks = [
        ("Alfajor GOAT", ["alfajor goat", "goat"]),
        ("Arcor", ["arcor", "aguila", "block", "bob", "mogul", "pistachos", "rocklets"]),
        ("Cofler", ["cofler", "cups"]),
        ("BNA", ["bna"]),
        ("Hamlet", ["hamlet"]),
        ("Colecciones La Nacion", ["colecciones la nacion", "rock de aca"]),
        ("Coppel Mexico", ["coppel"]),
        ("Prosegur", ["prosegur", "storyboard"]),
        ("T-Mobile", ["t-mobile", "bad bunny"]),
        ("Santa Fe", ["santa fe"]),
        ("Animatics", ["animatic"]),
        ("Pizza Para Ocho", ["pizza para ocho"]),
        ("PNT Perro", ["pnt perro"]),
        ("Edicion", ["canilla", "viudas", "pinguino"]),
    ]
    for name, needles in checks:
        if any(needle in text for needle in needles):
            return name
    if len(parts) > 1:
        return parts[1]
    return "Portfolio"


def campaign_for(parts, client):
    if len(parts) >= 3:
        candidate = parts[2]
        if candidate.lower() not in {"entrega final jpg", "jpg ok"}:
            return candidate
    if len(parts) >= 2:
        candidate = parts[1]
        if candidate != client:
            return candidate
    return client


def format_label(path):
    name = path.name.lower()
    if "9-16" in name or "9x16" in name or "1080x1920" in name:
        return "Vertical"
    if "16-9" in name or "16x9" in name:
        return "Horizontal"
    if "1-1" in name:
        return "Cuadrado"
    if "4-5" in name:
        return "Social 4:5"
    return path.suffix.upper().lstrip(".")


def make_video_poster(src, dest):
    if dest.exists() and dest.stat().st_size > 4096:
        return True
    if dest.exists():
        dest.unlink()
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        "1",
        "-i",
        str(src),
        "-frames:v",
        "1",
        "-vf",
        "scale='min(1280,iw)':-2",
        "-q:v",
        "4",
        str(dest),
    ]
    try:
        return subprocess.run(cmd, timeout=45).returncode == 0
    except subprocess.TimeoutExpired:
        return False


def make_image_preview(src, dest):
    if dest.exists() and dest.stat().st_size > 4096:
        return True
    if dest.exists():
        dest.unlink()
    size_mb = src.stat().st_size / 1024 / 1024
    if size_mb > 50:
        return False
    sips_cmd = [
        "sips",
        "-s",
        "format",
        "jpeg",
        "-Z",
        "1400",
        str(src),
        "--out",
        str(dest),
    ]
    try:
        if subprocess.run(sips_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=12).returncode == 0:
            return True
    except subprocess.TimeoutExpired:
        pass

    if size_mb > 150:
        return False

    cmd = [
        "magick",
        str(src),
        "-auto-orient",
        "-thumbnail",
        "1400x1400>",
        "-strip",
        "-quality",
        "78",
        str(dest),
    ]
    try:
        return subprocess.run(cmd, timeout=18).returncode == 0
    except subprocess.TimeoutExpired:
        return False


def collect_assets():
    assets = []
    paths = sorted(ROOT.rglob("*"))
    for index, path in enumerate(paths, start=1):
        if not path.is_file():
            continue
        if WEB in path.parents:
            continue
        lower_name = path.name.lower()
        if lower_name in SKIP_NAMES or "smbdelete" in lower_name:
            continue
        ext = path.suffix.lower()
        if ext not in VIDEO_EXTS and ext not in IMAGE_EXTS:
            continue

        rel_from_root = path.relative_to(ROOT)
        parts = list(rel_from_root.parts[:-1])
        media_type = "video" if ext in VIDEO_EXTS else "image"
        asset_id = slugify(str(rel_from_root.with_suffix("")))
        preview_dir = POSTERS if media_type == "video" else PREVIEWS
        preview = preview_dir / f"{asset_id}.jpg"

        print(f"[{len(assets) + 1}] {media_type}: {rel_from_root}", flush=True)
        ok = make_video_poster(path, preview) if media_type == "video" else make_image_preview(path, preview)
        if not ok:
            preview = None

        client = client_for(parts, path.name)
        item = {
            "id": asset_id,
            "title": clean_title(path),
            "type": media_type,
            "section": section_for(parts),
            "client": client,
            "campaign": campaign_for(parts, client),
            "format": format_label(path),
            "extension": ext.lstrip(".").upper(),
            "original": original_ref(path),
            "preview": web_ref(preview) if preview else "",
            "path": str(rel_from_root).replace(os.sep, "/"),
            "sizeMb": round(path.stat().st_size / 1024 / 1024, 1),
        }
        assets.append(item)
    return assets


def build_summary(assets):
    sections = {}
    clients = {}
    for item in assets:
        sections[item["section"]] = sections.get(item["section"], 0) + 1
        clients[item["client"]] = clients.get(item["client"], 0) + 1
    return {
        "total": len(assets),
        "videos": sum(1 for item in assets if item["type"] == "video"),
        "images": sum(1 for item in assets if item["type"] == "image"),
        "sections": sections,
        "clients": dict(sorted(clients.items())),
    }


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    POSTERS.mkdir(parents=True, exist_ok=True)
    assets = collect_assets()
    payload = {
        "profile": {
            "name": "Ivan Churba",
            "role": "Generacion, edicion y contenido audiovisual",
            "email": "ivan.churba@gmail.com",
        },
        "summary": build_summary(assets),
        "assets": assets,
    }
    (DATA / "manifest.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Generated {len(assets)} assets: {payload['summary']['videos']} videos, {payload['summary']['images']} images")


if __name__ == "__main__":
    main()
