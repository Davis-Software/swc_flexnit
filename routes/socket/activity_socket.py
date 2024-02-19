from __init__ import socket
from flask import request, session
from flask_socketio import emit, join_room, leave_room, rooms

from utils.password_manager import auth_required


USER_ACTIVITY = {}
ROOMS = []


def get_sid_rooms(sid):
    user_rooms = rooms(sid)
    user_rooms.pop(user_rooms.index(sid))
    return user_rooms


@socket.on("connect")
@auth_required
def connect():
    USER_ACTIVITY[session["username"]] = "online"
    emit("activity", USER_ACTIVITY, broadcast=True)


@socket.on("disconnect")
@auth_required
def disconnect():
    if session["username"] not in USER_ACTIVITY:
        return
    del USER_ACTIVITY[session["username"]]
    emit("activity", USER_ACTIVITY, broadcast=True)


@socket.on("change-activity")
@auth_required
def change_activity(activity):
    USER_ACTIVITY[session["username"]] = activity
    emit("activity", USER_ACTIVITY, broadcast=True)


@socket.on("get-activity")
@auth_required
def get_activity():
    emit("activity", USER_ACTIVITY, to=request.sid)


@socket.on("create-room")
@auth_required
def create_room():
    for room in get_sid_rooms(request.sid):
        leave_room(room)

    room = session["username"]
    join_room(room)
    emit("room-joined", True, to=request.sid)
    emit("user-joined", session["username"], to=room, include_self=False)
    ROOMS.append(room)


@socket.on("delete-room")
@auth_required
def delete_room():
    for room in get_sid_rooms(request.sid):
        leave_room(room)
        emit("user-left", session["username"], to=room, include_self=False)
        ROOMS.remove(session["username"])
    emit("room-left", True, to=request.sid)


@socket.on("join-room")
@auth_required
def route_join_room(room):
    for room in get_sid_rooms(request.sid):
        leave_room(room)

    if room not in ROOMS or room == session["username"]:
        emit("room-joined", False, to=request.sid)
        return

    join_room(room)
    emit("room-joined", True, to=request.sid)
    emit("user-joined", session["username"], to=room, include_self=False)


@socket.on("leave-room")
@auth_required
def route_leave_room():
    for room in get_sid_rooms(request.sid):
        leave_room(room)
        emit("user-left", session["username"], to=room, include_self=False)
    emit("room-left", True, to=request.sid)


@socket.on("room-event")
@auth_required
def room_event(data):
    emit("room-event", data, to=rooms(request.sid)[0], include_self=False)
