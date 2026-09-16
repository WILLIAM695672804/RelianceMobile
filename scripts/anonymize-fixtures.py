#!/usr/bin/env python3
"""Anonymise les réponses capturées : aucun secret ni donnée personnelle réelle dans les fixtures."""
import json
import pathlib
import re
import sys

SENSITIVE_KEYS = {"two_factor_secret", "two_factor_recovery_codes", "remember_token", "meta", "geom"}
USER_ID = "9d3f6a2e-0000-4000-8000-000000000001"
STORAGE_URL = re.compile(r"^https?://[^/]+/storage/")


def scrub_user(user: dict) -> None:
    # Le type de l'identifiant est conservé : le schéma doit refléter le contrat réel.
    user["id"] = USER_ID if isinstance(user.get("id"), str) else 1
    user["name"] = "Technicien Démo"
    user["email"] = "technicien@example.test"
    if "phone" in user:
        user["phone"] = None
    if user.get("avatar_url"):
        user["avatar_url"] = None
    for role in user.get("roles", []):
        if isinstance(role.get("pivot"), dict):
            role["pivot"]["model_id"] = user["id"]


def scrub(node):
    """Parcours récursif : secrets retirés, utilisateur, propriétaire, adresses et URL de stockage neutralisés."""
    if isinstance(node, list):
        for item in node:
            scrub(item)
        return
    if not isinstance(node, dict):
        return
    for key in SENSITIVE_KEYS & node.keys():
        del node[key]
    if isinstance(node.get("user"), dict):
        scrub_user(node["user"])
    for key in ("user_id", "validated_by"):
        if node.get(key):
            node[key] = USER_ID
    if node.get("address"):
        node["address"] = "Adresse de démonstration"
    for key in ("url", "avatar_url"):
        if isinstance(node.get(key), str):
            node[key] = STORAGE_URL.sub("http://api.test/storage/", node[key])
    for value in node.values():
        scrub(value)


def main(source: str, destination: str) -> None:
    out = pathlib.Path(destination)
    out.mkdir(parents=True, exist_ok=True)
    for path in sorted(pathlib.Path(source).glob("*.json")):
        body = json.loads(path.read_text(encoding="utf-8"))
        scrub(body)
        (out / path.name).write_text(json.dumps(body, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"fixture écrite : {out / path.name}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
