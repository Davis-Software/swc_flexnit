from __init__ import config


def get_wsl_path(path: str):
    if not config.get_bool("USE_WSL", False):
        return path

    path_parts = path.split(":\\")
    return f"/mnt/{path_parts[0].lower()}/" + path_parts[1].replace('\\', '/')


def make_wsl_command(command: list[str]):
    if not config.get_bool("USE_WSL", False):
        return command

    dist = config["WSL_DISTRO"]
    return ["wsl", "-d", dist, *command]


def get_local_wsl_temp_dir():
    if not config.get_bool("USE_WSL", False):
        return "/tmp/"

    return f"\\\\wsl.localhost\\{config['WSL_DISTRO']}\\tmp\\"
