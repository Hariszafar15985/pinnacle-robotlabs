import random
import string

from rest_framework.response import Response


def success_response(data=None, code: int = None) -> Response:
    res = {"success": True}
    if not code:
        code = 200
    if data:
        res.update({"data": data})
    return Response(data, status=code)


def error_response(error, code: int = None, data=None) -> Response:
    if not data:
        data = {}
    res = {"success": False, "error": error, "data": data}
    if code is not None:
        return Response(res, status=code)
    return Response(res, status=400)


def generate_string(length=6) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length)).upper()
