from __init__ import app
from flask import render_template, request

from models.series import get_all_series, add_episode


@app.route("/temp/add-episode", methods=["GET", "POST"])
def temp_add_episode():
    series = get_all_series()

    if request.method == "GET":
        return render_template(
            "pages/temp_add_episode.html",
            series=series
        )

    if request.method == "POST":
        series_uuid = request.form.get("series")
        title = request.form.get("title")
        description = request.form.get("description")
        season = request.form.get("season")
        episode = request.form.get("episode")

        ret_data = {
            "series": series,
            "season": int(season),
            "episode": int(episode),
            "selected_series": series_uuid,
        }

        if None not in [series_uuid, title, season, episode]:
            ep = add_episode(series_uuid, title, int(season), int(episode))
            if description is not None:
                ep.description = description
                ep.commit()

            if ep is not None:
                return render_template(
                    "pages/temp_add_episode.html",
                    **ret_data,
                    info="Episode added successfully"
                )

        return render_template(
            "pages/temp_add_episode.html",
            **ret_data,
            error="Episode could not be added"
        )
