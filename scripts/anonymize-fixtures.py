#!/usr/bin/env python3
"""Anonymise les réponses capturées : aucun secret ni donnée personnelle réelle dans les fixtures."""
import json
import pathlib
import sys

SENSITIVE_KEYS = {"two_factor_secret", "two_factor_recovery_codes", "remember_token", "meta"}


def scrub_user(user: dict) -> None:
    for key in SENSITIVE_KEYS:
        user.pop(key, None)
    # Le type de l'identifiant est conservé : le schéma doit refléter le contrat réel.
    user["id"] = "9d3f6a2e-0000-4000-8000-000000000001" if isinstance(user.get("id"), str) else 1
    user["name"] = "Technicien Démo"
    user["email"] = "technicien@example.test"
    if "phone" in user:
        user["phone"] = None
    if user.get("avatar_url"):
        user["avatar_url"] = None
    for role in user.get("roles", []):
        if isinstance(role.get("pivot"), dict):
            role["pivot"]["model_id"] = user["id"]


def main(source: str, destination: str) -> None:
    out = pathlib.Path(destination)
    out.mkdir(parents=True, exist_ok=True)
    for path in sorted(pathlib.Path(source).glob("*.json")):
        body = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(body, dict) and isinstance(body.get("user"), dict):
            scrub_user(body["user"])
        (out / path.name).write_text(json.dumps(body, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"fixture écrite : {out / path.name}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
