#!/usr/bin/env python3
import json
import re
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
MANIFEST = WEB / "data" / "manifest.json"
OUT = WEB / "data" / "site-data.js"


SECTION_MAP = {
    "edicion-generacion-ia": {
        "title": "Edicion de video + Generacion IA",
        "kicker": "Video + IA",
        "description": "Piezas donde edicion, generacion y adaptacion audiovisual trabajan juntas.",
        "href": "edicion-generacion-ia.html",
        "accent": "#74d9c4",
    },
    "generacion-imagenes-ia": {
        "title": "Generacion de Imagenes IA",
        "kicker": "Imagen IA",
        "description": "Imagenes, campanas graficas y storyboards generados o desarrollados con IA.",
        "href": "generacion-imagenes-ia.html",
        "accent": "#9fd7ff",
    },
    "generacion-video-ia": {
        "title": "Generacion de Video IA",
        "kicker": "Video IA",
        "description": "Piezas audiovisuales generadas con IA para marcas, productos y contenidos digitales.",
        "href": "generacion-video-ia.html",
        "accent": "#b8f06a",
    },
    "edicion-video": {
        "title": "Edicion de Video",
        "kicker": "Edicion",
        "description": "Montaje, recap, contenido vertical y piezas finales de edicion.",
        "href": "edicion-video.html",
        "accent": "#d8d5ce",
    },
}

PROJECTS = [
    {
        "section": "edicion-generacion-ia",
        "title": "Alfajor GOAT",
        "description": "Pieza principal horizontal para campana de producto.",
        "main": "A - Generacion y Edicion/Alfajor GOAT/10 segundos/GOAT 10 seg 16-9.mp4",
        "match": lambda p: p == "A - Generacion y Edicion/Alfajor GOAT/10 segundos/GOAT 10 seg 16-9.mp4",
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Animatic Santa Fe",
        "description": "Animatics de guion para desarrollo de pieza.",
        "main": "A - Generacion y Edicion/Animatic Santa Fe/Animatic - Guión 1.mp4",
        "match": lambda p: p.startswith("A - Generacion y Edicion/Animatic Santa Fe/"),
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Arcor Halloween",
        "description": "Piezas de temporada con foco en producto y tono de campaña.",
        "main": "A - Generacion y Edicion/Arcor Halloween/Candy Bar Extreme.mp4",
        "match": lambda p: p.startswith("A - Generacion y Edicion/Arcor Halloween/"),
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Arcor Navidad",
        "description": "Sistema de piezas navidenas para distintas marcas y productos.",
        "main": "A - Generacion y Edicion/Arcor Navidad/Aguila Postres Ok.mp4",
        "match": lambda p: p.startswith("A - Generacion y Edicion/Arcor Navidad/"),
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Arcor Pascuas",
        "description": "Piezas principales y bumpers para campaña de Pascuas.",
        "main": "A - Generacion y Edicion/Arcor Pascuas/BoB Final Ok.mp4",
        "match": lambda p: p.startswith("A - Generacion y Edicion/Arcor Pascuas/"),
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Cofler Cups",
        "description": "Contenido de producto con variantes de pieza final.",
        "main": "A - Generacion y Edicion/Cofler Cups/Cofler Cups FINAL-Musica 1.mp4",
        "match": lambda p: p.startswith("A - Generacion y Edicion/Cofler Cups/"),
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Animatic Imperial",
        "description": "Animatic audiovisual para presentacion de idea.",
        "main": "A - Generacion y Edicion/ANIMATIC Imperial.mp4",
        "match": lambda p: p == "A - Generacion y Edicion/ANIMATIC Imperial.mp4",
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Animatic Seguros",
        "description": "Animatic narrativo para pieza de seguros.",
        "main": "A - Generacion y Edicion/ANIMATIC Seguros.mov",
        "match": lambda p: p == "A - Generacion y Edicion/ANIMATIC Seguros.mov",
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Semana de la Dulzura",
        "description": "Pieza de campana para Arcor.",
        "main": "A - Generacion y Edicion/Arcor Semana de la Dulzura.mp4",
        "match": lambda p: p == "A - Generacion y Edicion/Arcor Semana de la Dulzura.mp4",
    },
    {
        "section": "edicion-generacion-ia",
        "title": "PNT Perro",
        "description": "Pieza corta para integracion de contenido.",
        "main": "A - Generacion y Edicion/PNT Perro.mp4",
        "match": lambda p: p == "A - Generacion y Edicion/PNT Perro.mp4",
    },
    {
        "section": "edicion-generacion-ia",
        "title": "Pizza Para Ocho",
        "description": "Contenido audiovisual con tratamiento de edicion y generacion.",
        "main": "A - Generacion y Edicion/Pizza Para Ocho.mp4",
        "match": lambda p: p == "A - Generacion y Edicion/Pizza Para Ocho.mp4",
    },
    {
        "section": "generacion-video-ia",
        "title": "BNA Mundial",
        "description": "Promos y PNTs generados para verticales de comunicacion del banco.",
        "main": "A - Generacion/BNA/BNA_MUNDIAL_PROMO_GENERICO_30 SEG_16x9.mp4",
        "match": lambda p: p.startswith("A - Generacion/BNA/"),
    },
    {
        "section": "generacion-video-ia",
        "title": "Colecciones La Nacion",
        "description": "Piezas audiovisuales para la coleccion Rock de Aca.",
        "main": "A - Generacion/Colecciones La Nacion/LN Rock De Aca - Seru Giran.mp4",
        "match": lambda p: p.startswith("A - Generacion/Colecciones La Nacion/"),
    },
    {
        "section": "generacion-video-ia",
        "title": "Hamlet",
        "description": "Serie de versiones generadas para Arcor Hamlet.",
        "main": "A - Generacion/Hamlet/Arcor Hamlet F_Final 1.mp4",
        "match": lambda p: p.startswith("A - Generacion/Hamlet/"),
    },
    {
        "section": "generacion-imagenes-ia",
        "title": "Coppel Mexico",
        "description": "Galeria de imagenes finales para campana grafica. Se excluyen masters TIF pesados.",
        "main": "A - Generacion/Coppel Mexico/ENTREGA FINAL JPG/JPG OK/1 - Moda Joven 56 vino HIGH 300dpi copy.jpg",
        "match": lambda p: p.startswith("A - Generacion/Coppel Mexico/ENTREGA FINAL JPG/JPG OK/") and p.lower().endswith(".jpg"),
        "kind": "gallery",
        "galleryHref": "coppel-mexico.html",
    },
    {
        "section": "generacion-imagenes-ia",
        "title": "Storyboard Prosegur",
        "description": "Secuencia visual completa para storyboard.",
        "main": "A - Generacion/STORYBOARD Prosegur/1 - llegada.png",
        "match": lambda p: p.startswith("A - Generacion/STORYBOARD Prosegur/"),
        "kind": "gallery",
        "galleryHref": "storyboard-prosegur.html",
    },
    {
        "section": "generacion-video-ia",
        "title": "Arcor Cofler Obleas Max",
        "description": "Pieza generada para producto Cofler.",
        "main": "A - Generacion/Arcor Cofler Obleas Max .mov",
        "match": lambda p: p == "A - Generacion/Arcor Cofler Obleas Max .mov",
    },
    {
        "section": "generacion-video-ia",
        "title": "Cofler Dulce de Leche",
        "description": "Contenido generado para producto Cofler.",
        "main": "A - Generacion/Cofler Dulce De Leche.mp4",
        "match": lambda p: p == "A - Generacion/Cofler Dulce De Leche.mp4",
    },
    {
        "section": "generacion-video-ia",
        "title": "T-Mobile / Bad Bunny",
        "description": "Pieza generada para entorno digital.",
        "main": "A - Generacion/T-Mobile - Bad Bunny Online Final - HD Digital - Sin Subs.mp4",
        "match": lambda p: p == "A - Generacion/T-Mobile - Bad Bunny Online Final - HD Digital - Sin Subs.mp4",
    },
    {
        "section": "edicion-video",
        "title": "Canilla",
        "description": "Pieza final de edicion.",
        "main": "A - Edicion/Canilla-OK.mp4",
        "match": lambda p: p == "A - Edicion/Canilla-OK.mp4",
    },
    {
        "section": "edicion-video",
        "title": "Pinguino",
        "description": "Contenido vertical editado para formato social.",
        "main": "A - Edicion/Pinguino 1080x1920_1.mp4",
        "match": lambda p: p == "A - Edicion/Pinguino 1080x1920_1.mp4",
    },
    {
        "section": "edicion-video",
        "title": "Recap Viudas Negras",
        "description": "Recap audiovisual de larga duracion.",
        "main": "A - Edicion/Recap Viudas Negras.mp4",
        "match": lambda p: p == "A - Edicion/Recap Viudas Negras.mp4",
    },
]

YOUTUBE_BY_PROJECT_PIECE = {
    ("Alfajor GOAT", "Version principal"): "6-AFnC29qls",
    ("Animatic Santa Fe", "Guion 1"): "fg1FPQXDeTU",
    ("Animatic Santa Fe", "Guion 2"): "euzPqKLAH3I",
    ("Arcor Halloween", "Candy Bar Extreme"): "PQL3RsLVEzw",
    ("Arcor Halloween", "Sillon"): "AdRL4PNX4XQ",
    ("Arcor Navidad", "Aguila Postres"): "kNQIF58SiNM",
    ("Arcor Navidad", "Block"): "xNdifKLdTxw",
    ("Arcor Navidad", "BoB"): "gIwf8ondeio",
    ("Arcor Navidad", "Mogul"): "YiZmWrp0Z1I",
    ("Arcor Navidad", "Pistachos"): "Ekk3WStJkTQ",
    ("Arcor Pascuas", "Aguila"): "Qo0sQn2EB5U",
    ("Arcor Pascuas", "BoB"): "9N7QZDH8AUs",
    ("Arcor Pascuas", "Cofler Huevos"): "sx52kZJ_ru8",
    ("Arcor Pascuas", "Rocklets Cohete Vert"): "T3AnpPDwf0g",
    ("Cofler Cups", "Cofler Cups"): "AC-zYU-7IyY",
    ("Animatic Imperial", "ANIMATIC Imperial"): "5QK5FIsngxk",
    ("Animatic Seguros", "ANIMATIC Seguros"): "hAiqBGWj_7Q",
    ("Semana de la Dulzura", "Arcor Semana de la Dulzura"): "InaOZRp_ADU",
    ("Pizza Para Ocho", "Pizza Para Ocho"): "17kklHbTE2w",
    ("BNA Mundial", "PNT Combustible"): "rM6uXCiIf_0",
    ("BNA Mundial", "Promo Generico"): "llfRzn-AZbs",
    ("BNA Mundial", "Promo Hogar"): "xLDvQL1xEQQ",
    ("BNA Mundial", "Promo Supermercado"): "cDsAbMgQFCg",
    ("Hamlet", "Final 1"): "jQAGhvMeyOA",
    ("Arcor Cofler Obleas Max", "Arcor Cofler Obleas Max"): "Qxbnex-0x74",
    ("Cofler Dulce de Leche", "Cofler Dulce De Leche"): "ofxjjZ5Vkc4",
    ("T-Mobile / Bad Bunny", "T Mobile Bad Bunny Online HD Digital Sin Subs"): "XpHZPCY6ifg",
}

VIRTUAL_VIDEO_PROJECTS = {
    "Colecciones La Nacion": [
        ("Cerveza", "S8jC0fGXpcI"),
        ("Topa", "3ZPMJCiI4Fs"),
        ("Fito", "vFLdSbiUKKg"),
        ("Seru", "g-5pDAQby7k"),
        ("Divididos", "BV2LO5qyGKM"),
        ("Dinosaurios", "HqV6gQwRL_k"),
        ("Esqueleto", "32graIt3jCE"),
    ],
}


def clean_piece_title(path):
    name = Path(path).stem
    storyboard_titles = {
        "0 detalle": "00 - Detalle inicial",
        "1 - llegada": "01 - Llegada",
        "2 - int auto": "02 - Interior auto",
        "3 - baja del auto - 1 copy 2": "03 - Baja del auto",
        "3 - baja del auto - 2 copy": "04 - Accion de llegada",
        "3 - baja del auto - 3 copy": "05 - Salida del auto",
        "4 - camara entrada": "06 - Camara de entrada",
        "5 copy": "07 - Plano de transicion",
        "6 corregido": "08 - Ingreso",
        "7 corregida": "09 - Puerta",
        "8 - entra a casa - 1": "10 - Entra a casa",
        "9 - detalle alarma - 5 copy": "11 - Detalle alarma",
        "10 - sentada living - 3 copy": "12 - Sentada en living",
        "10 b2": "13 - Living alternativa",
        "11 - int bolso - 1": "14 - Interior bolso",
        "11 - int bolso - 2": "15 - Interior bolso detalle",
        "11,5 - camara living": "16 - Camara living",
        "12 - guarda raqueta - 1 copy": "17 - Guarda raqueta",
        "12,5 1": "18 - Plano intermedio",
        "13 - detalle camara": "19 - Detalle camara",
        "14 - salida casa - 1": "20 - Salida de casa",
        "15 - auto se va - 1": "21 - Auto se va",
    }
    if "STORYBOARD Prosegur" in path and name in storyboard_titles:
        return storyboard_titles[name]
    replacements = {
        "BNA MUNDIAL_PNT_COMBUSTIBLE_16x9_15SEG": "PNT Combustible",
        "BNA MUNDIAL_PNT_HOGAR_16x9_15SEG": "PNT Hogar",
        "BNA MUNDIAL_PNT_HOTSALE_16x9_15SEG": "PNT Hot Sale",
        "BNA_MUNDIAL_PROMO_GENERICO_30 SEG_16x9": "Promo Generico",
        "BNA_MUNDIAL_PROMO_HOGAR_27 SEG_16x9": "Promo Hogar",
        "BNA_MUNDIAL_PROMO_SUPERMERCADO_27 SEG_16x9": "Promo Supermercado",
        "GOAT 10 seg 16-9": "Version principal",
        "GOAT 10 seg 1-1": "Adaptacion cuadrada",
        "GOAT 10 seg 4-5": "Adaptacion social",
        "GOAT 10 seg 9-16": "Adaptacion vertical",
        "6sec Armado 16-9 locu": "Bumper horizontal",
        "6sec Armado 9x16 locu_1": "Bumper vertical",
        "6sec Armado 1-1 locu": "Bumper cuadrado",
        "6sec Armado 4-5 locu": "Bumper social",
        "6sec Armado 16-9 - v2": "Bumper horizontal v2",
        "6sec Armado 9-16 v2": "Bumper vertical v2",
        "6sec Armado 1-1 v2": "Bumper cuadrado v2",
        "6sec Armado 4-5 v2": "Bumper social v2",
        "Arcor Hamlet F_Final 1": "Final 1",
        "Arcor Hamlet F_Final 2": "Final 2",
        "Arcor Hamlet F_Final 3": "Final 3",
        "Animatic - Guión 1": "Guion 1",
        "Animatic - Guión 2": "Guion 2",
        "Mogul  Nuevo 1": "Mogul",
        "Mogul  Nuevo 2": "Mogul alternativa",
        "Mogul  Ok": "Mogul final",
        "Cofler Cups FINAL-Musica 1": "Cofler Cups",
        "cups 1": "Variante",
        "Pinguino 1080x1920_1": "Pinguino",
        "LN Rock De Aca - Seru Giran": "Seru Giran",
        "LN Rock De Aca - Fito Paez": "Fito Paez",
        "LN Rock De Aca - Divididos": "Divididos",
        "VIDEO-2025-04-01-15-03-33": "Pieza adicional",
        "Dupla Niños 08 amarillo 300x300cm300dpi__ copy": "Ninos amarillo",
        "Dupla Niños 08 gris 300x300cm300dpi__ copy": "Ninos gris",
    }
    if name in replacements:
        return replacements[name]
    name = name.replace("_", " ").replace("-", " ")
    name = re.sub(r"\b(OK|Ok|FINAL|Final|copy|NEW|HIGH)\b", "", name)
    name = re.sub(r"\b\d+\s?(x|X|-)\s?\d+\b", "", name)
    name = re.sub(r"\b\d+x\d+cm\d*dpi\b", "", name, flags=re.I)
    name = re.sub(r"\b\d+x\d+x\d+\b", "", name, flags=re.I)
    name = re.sub(r"\b\d+\s?cm\b", "", name, flags=re.I)
    name = re.sub(r"\b\d+\s?SEG\b", "", name, flags=re.I)
    name = re.sub(r"\b\d+dpi\b", "", name, flags=re.I)
    name = re.sub(r"\b\d+\s*$", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name or Path(path).stem


def sort_key(asset):
    path = asset["path"]
    title = clean_piece_title(path)
    if "STORYBOARD Prosegur" in path:
        match = re.match(r"(\d+)", title)
        return (int(match.group(1)) if match else 999, path)
    return (0, path)


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
    return value.strip("-")


def web_path(path):
    return path.relative_to(WEB).as_posix()


def youtube_thumb(youtube_id):
    return f"https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg"


def add_youtube_fields(item, youtube_id):
    item["provider"] = "youtube"
    item["youtubeId"] = youtube_id
    item["youtubeUrl"] = f"https://youtu.be/{youtube_id}"
    item["embedUrl"] = f"https://www.youtube.com/embed/{youtube_id}"
    return item


def optimized_webp_for(asset):
    title_slug = slug(clean_piece_title(asset["path"]))
    if asset["path"].startswith("A - Generacion/Coppel Mexico/"):
        candidate = WEB / "assets" / "media" / "optimized" / "02-generacion-imagenes-ia" / "coppel-mexico" / "webp" / f"{title_slug}.webp"
        if candidate.exists():
            return web_path(candidate)

    if asset["path"].startswith("A - Generacion/STORYBOARD Prosegur/"):
        candidate = WEB / "assets" / "media" / "optimized" / "02-generacion-imagenes-ia" / "storyboard-prosegur" / f"{title_slug}.webp"
        if candidate.exists():
            return web_path(candidate)

    return None


def optimized_image_for(asset):
    webp = optimized_webp_for(asset)
    if webp:
        return webp

    source_name = Path(asset["path"]).name
    if asset["path"].startswith("A - Generacion/Coppel Mexico/"):
        candidate = WEB / "assets" / "media" / "optimized" / "02-generacion-imagenes-ia" / "coppel-mexico" / "jpg compress" / source_name
        if candidate.exists():
            return web_path(candidate)

    if asset["path"].startswith("A - Generacion/STORYBOARD Prosegur/"):
        title_slug = slug(clean_piece_title(asset["path"]))
        original_extension = Path(asset["path"]).suffix.lower()
        candidate = WEB / "assets" / "media" / "images" / "storyboard-prosegur" / f"{title_slug}{original_extension}"
        if candidate.exists():
            return web_path(candidate)

    return None


def item_for(asset, project_title=None):
    generated_preview = WEB / "assets" / "previews" / f"{asset['id']}.png"
    preview = asset["preview"]
    if generated_preview.exists():
        preview = f"assets/previews/{asset['id']}.png"
    original = asset["original"]
    optimized_image = optimized_image_for(asset) if asset["type"] == "image" else None
    if optimized_image:
        original = optimized_image
        preview = optimized_image
    item = {
        "id": asset["id"],
        "title": clean_piece_title(asset["path"]),
        "type": asset["type"],
        "preview": preview,
        "original": original,
        "full": original,
        "extension": asset["extension"],
        "sizeMb": asset["sizeMb"],
        "path": asset["path"],
    }
    if asset["type"] == "video" and project_title:
        youtube_id = YOUTUBE_BY_PROJECT_PIECE.get((project_title, item["title"]))
        if youtube_id:
            add_youtube_fields(item, youtube_id)
    return item


def virtual_video_item(project_title, title, youtube_id):
    piece_id = f"youtube-{slug(project_title)}-{slug(title)}"
    return add_youtube_fields({
        "id": piece_id,
        "title": title,
        "type": "video",
        "preview": youtube_thumb(youtube_id),
        "original": "",
        "full": "",
        "extension": "YouTube",
        "sizeMb": 0,
        "path": piece_id,
    }, youtube_id)


def scrub_public_item(item):
    item.pop("path", None)
    if item.get("provider") == "youtube":
        item["original"] = item["youtubeUrl"]
        item["full"] = item["youtubeUrl"]
    return item


def scrub_public_payload(payload):
    for section in payload["sections"]:
        for project in section["projects"]:
            scrub_public_item(project["main"])
            for piece in project["pieces"]:
                scrub_public_item(piece)
    return payload


def main():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assets = data["assets"]
    by_path = {asset["path"]: asset for asset in assets}
    sections = {slug: {**meta, "slug": slug, "projects": []} for slug, meta in SECTION_MAP.items()}

    for config in PROJECTS:
        if config["title"] in VIRTUAL_VIDEO_PROJECTS:
            pieces = [virtual_video_item(config["title"], title, youtube_id) for title, youtube_id in VIRTUAL_VIDEO_PROJECTS[config["title"]]]
            project = {
                "title": config["title"],
                "description": config["description"],
                "kind": config.get("kind", "video"),
                "galleryHref": config.get("galleryHref", ""),
                "mainId": pieces[0]["id"],
                "main": pieces[0],
                "pieces": pieces,
            }
            sections[config["section"]]["projects"].append(project)
            continue

        source_pieces = [asset for asset in assets if config["match"](asset["path"])]
        if not source_pieces:
            continue
        main_asset = by_path.get(config["main"], source_pieces[0])
        source_pieces.sort(key=lambda asset: (asset["path"] != main_asset["path"], asset["path"]))
        pieces = [item_for(asset, config["title"]) for asset in sorted(source_pieces, key=sort_key)]
        if config.get("kind", "video") == "video":
            pieces = [piece for piece in pieces if piece.get("provider") == "youtube"]
        if not pieces:
            continue
        main = next((piece for piece in pieces if piece["path"] == main_asset["path"]), pieces[0])
        project = {
            "title": config["title"],
            "description": config["description"],
            "kind": config.get("kind", "video"),
            "galleryHref": config.get("galleryHref", ""),
            "mainId": main["id"],
            "main": main,
            "pieces": pieces,
        }
        sections[config["section"]]["projects"].append(project)

    payload = {
        "profile": {
            "name": "Ivan Churba",
            "role": "Generacion IA, edicion y contenido audiovisual",
            "email": "ivan.churba@gmail.com",
        },
        "sections": [section for section in sections.values() if section["projects"]],
    }
    scrub_public_payload(payload)
    OUT.write_text("window.PORTFOLIO_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print("Generated", OUT)


if __name__ == "__main__":
    main()
