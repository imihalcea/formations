from datetime import date, datetime


def validate_booking(booking: dict) -> tuple[bool, list[str]]:
    """
    Valide une réservation. Retourne (True, []) si valide,
    sinon (False, [liste des erreurs]).

    Champs attendus :
        customer_name  : str, non vide
        start_date     : date ou str ISO-8601 (YYYY-MM-DD)
        end_date       : date ou str ISO-8601 (YYYY-MM-DD)
        guests         : int >= 1
        room_id        : str ou int, non vide / non nul
    """
    errors = []

    # --- customer_name ---
    name = booking.get("customer_name", "")
    if not isinstance(name, str) or not name.strip():
        errors.append("customer_name est requis et doit être une chaîne non vide.")

    # --- dates ---
    def parse_date(value, field):
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)
            except ValueError:
                errors.append(f"{field} doit être au format YYYY-MM-DD.")
                return None
        errors.append(f"{field} est requis (date ou str ISO-8601).")
        return None

    start = parse_date(booking.get("start_date"), "start_date")
    end = parse_date(booking.get("end_date"), "end_date")

    today = date.today()

    if start is not None and start < today:
        errors.append("start_date ne peut pas être dans le passé.")

    if start is not None and end is not None and end <= start:
        errors.append("end_date doit être strictement postérieure à start_date.")

    # --- guests ---
    guests = booking.get("guests")
    if not isinstance(guests, int) or isinstance(guests, bool) or guests < 1:
        errors.append("guests doit être un entier >= 1.")

    # --- room_id ---
    room_id = booking.get("room_id")
    if room_id is None or (isinstance(room_id, str) and not room_id.strip()):
        errors.append("room_id est requis.")

    return (len(errors) == 0, errors)
