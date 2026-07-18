import streamlit as st
import pandas as pd
from datetime import date, datetime
from streamlit_autorefresh import st_autorefresh
from matplotlib import colormaps
import matplotlib.colors as mcolors
import os

st.title("🏋️ My Gym Analytics Dashboard")

DATA_FILE = "data/workouts.csv"

EXERCISE_DB = {
    "SBD (Squat / Bench / Deadlift)": {
        "Barbell Back Squat": "Legs",
        "Barbell Front Squat": "Legs",
        "Conventional Deadlift": "Back",
        "Romanian Deadlift": "Legs",
        "Barbell Bench Press": "Chest",
        "Incline Barbell Bench Press": "Chest",
        "Overhead Press (Barbell)": "Shoulders",
    },
    "Machines": {
        "Chest Press Machine": "Chest",
        "Lat Pulldown": "Back",
        "Seated Row Machine": "Back",
        "Leg Press": "Legs",
        "Leg Extension": "Legs",
        "Leg Curl": "Legs",
        "Shoulder Press Machine": "Shoulders",
        "Cable Lateral Raise": "Shoulders",
        "Tricep Pushdown": "Arms",
        "Bicep Curl Machine": "Arms",
        "Ab Crunch Machine": "Core",
    },
    "Bodyweight / Calisthenics": {
        "Pull-up": "Back",
        "Weighted Pull-up": "Back",
        "Chin-up": "Back",
        "Push-up": "Chest",
        "Dip": "Chest",
        "Plank": "Core",
        "Hanging Leg Raise": "Core",
        "Pistol Squat": "Legs",
        "Bodyweight Squat": "Legs",
    },
}

RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]
SESSION_TYPES = ["Upper Body", "Lower Body", "Push", "Pull", "Legs", "Full Body", "Other"]
MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]

os.makedirs("data", exist_ok=True)

if os.path.exists(DATA_FILE):
    df = pd.read_csv(DATA_FILE)
    for col in ["session_id", "session_name", "muscle_group"]:
        if col not in df.columns:
            df[col] = None
else:
    df = pd.DataFrame(columns=[
        "session_id", "session_name", "date", "exercise",
        "muscle_group", "weight_kg", "reps", "rpe"
    ])

# ---- Session state setup ----
if "workout_active" not in st.session_state:
    st.session_state.workout_active = False
if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "session_name" not in st.session_state:
    st.session_state.session_name = None
if "workout_start" not in st.session_state:
    st.session_state.workout_start = None

# ---- Live workout session controls ----
st.subheader("🏁 Live workout session")

if not st.session_state.workout_active:
    live_session_name = st.selectbox("What are you training today?", SESSION_TYPES, key="live_session_type")
    if st.button("▶️ Start Workout"):
        st.session_state.workout_active = True
        st.session_state.session_name = live_session_name
        st.session_state.workout_start = datetime.now()
        st.session_state.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        st.rerun()
else:
    st_autorefresh(interval=1000, key="timer_refresh")
    elapsed = datetime.now() - st.session_state.workout_start
    minutes, seconds = divmod(int(elapsed.total_seconds()), 60)
    st.metric(f"⏱️ {st.session_state.session_name} in progress", f"{minutes:02d}:{seconds:02d}")

    if st.button("⏹️ End Workout"):
        st.session_state.workout_active = False
        st.session_state.workout_start = None
        st.session_state.session_id = None
        st.rerun()

# ---- Log a set during a live workout ----
if st.session_state.workout_active:
    st.subheader("Log a set")
    with st.form("log_set_form_live"):
        category = st.selectbox("Category", list(EXERCISE_DB.keys()), key="live_category")
        exercise = st.selectbox("Exercise", list(EXERCISE_DB[category].keys()), key="live_exercise")
        muscle_group = EXERCISE_DB[category][exercise]
        st.caption(f"Muscle group: **{muscle_group}** (auto-detected)")
        weight = st.number_input("Weight (kg)", min_value=0.0, step=0.5, key="live_weight")
        reps = st.number_input("Reps", min_value=1, step=1, key="live_reps")
        rpe = st.selectbox("RPE", RPE_OPTIONS, index=4, key="live_rpe")
        submitted = st.form_submit_button("Log set")

    if submitted:
        new_row = pd.DataFrame([{
            "session_id": st.session_state.session_id,
            "session_name": st.session_state.session_name,
            "date": date.today().isoformat(),
            "exercise": exercise,
            "muscle_group": muscle_group,
            "weight_kg": weight,
            "reps": reps,
            "rpe": rpe
        }])
        df = pd.concat([df, new_row], ignore_index=True)
        df.to_csv(DATA_FILE, index=False)
        st.success(f"Logged: {exercise} — {weight}kg x {reps} @ RPE {rpe}")
else:
    st.info("Start a live workout above to track it with a timer — or log a past workout below anytime.")

# ---- Log a past / forgotten workout (no live session needed) ----
with st.expander("📝 Log a past or forgotten workout"):
    st.caption("Use this to backfill a session you forgot to track live — e.g. yesterday's leg day.")
    with st.form("log_set_form_manual"):
        log_date = st.date_input("Date", value=date.today(), key="manual_date")
        workout_name = st.selectbox("Workout name", SESSION_TYPES, key="manual_session_type")
        category = st.selectbox("Category", list(EXERCISE_DB.keys()), key="manual_category")
        exercise = st.selectbox("Exercise", list(EXERCISE_DB[category].keys()), key="manual_exercise")
        muscle_group = EXERCISE_DB[category][exercise]
        st.caption(f"Muscle group: **{muscle_group}** (auto-detected)")
        weight = st.number_input("Weight (kg)", min_value=0.0, step=0.5, key="manual_weight")
        reps = st.number_input("Reps", min_value=1, step=1, key="manual_reps")
        rpe = st.selectbox("RPE", RPE_OPTIONS, index=4, key="manual_rpe")
        submitted_manual = st.form_submit_button("Log past set")

    if submitted_manual:
        # Same date + same workout name = grouped into the same session automatically
        manual_session_id = f"manual_{log_date.isoformat()}_{workout_name.replace(' ', '')}"
        new_row = pd.DataFrame([{
            "session_id": manual_session_id,
            "session_name": workout_name,
            "date": log_date.isoformat(),
            "exercise": exercise,
            "muscle_group": muscle_group,
            "weight_kg": weight,
            "reps": reps,
            "rpe": rpe
        }])
        df = pd.concat([df, new_row], ignore_index=True)
        df.to_csv(DATA_FILE, index=False)
        st.success(f"Logged: {exercise} — {weight}kg x {reps} @ RPE {rpe} on {log_date.isoformat()}")

# ---- Workout history, grouped by session, with delete ----
st.subheader("📋 Workout history")

if df.empty:
    st.caption("No sets logged yet.")
else:
    df["session_id"] = df["session_id"].fillna("legacy")
    df["session_name"] = df["session_name"].fillna("Unlabeled")

    df_sorted = df.sort_values("session_id", ascending=False)

    for session_id, session_df in df_sorted.groupby("session_id", sort=False):
        session_name = session_df["session_name"].iloc[0]
        session_date = session_df["date"].iloc[0]
        total_volume = (session_df["weight_kg"] * session_df["reps"]).sum()

        with st.expander(
            f"🗂️ {session_name} — {session_date} "
            f"({len(session_df)} sets, {total_volume:.0f}kg total volume)"
        ):
            for idx, row in session_df.iterrows():
                col1, col2 = st.columns([5, 1])
                with col1:
                    st.write(
                        f"**{row['exercise']}** ({row['muscle_group']}) — "
                        f"{row['weight_kg']}kg x {row['reps']} @ RPE {row['rpe']}"
                    )
                with col2:
                    if st.button("🗑️ Delete", key=f"delete_{idx}"):
                        df = df.drop(idx)
                        df.to_csv(DATA_FILE, index=False)
                        st.rerun()

# ---- Analytics ----
if not df.empty:
    analytics_df = df.copy()
    analytics_df["date"] = pd.to_datetime(analytics_df["date"])
    analytics_df["est_1rm"] = analytics_df["weight_kg"] * (1 + analytics_df["reps"] / 30)
    analytics_df["volume"] = analytics_df["weight_kg"] * analytics_df["reps"]

    st.subheader("📈 Estimated 1RM trend")
    exercises = sorted(analytics_df["exercise"].unique())
    selected_exercise = st.selectbox("Choose an exercise", exercises)

    exercise_df = analytics_df[analytics_df["exercise"] == selected_exercise].sort_values("date")
    daily_best = exercise_df.groupby("date")["est_1rm"].max()

    st.line_chart(daily_best)

    st.subheader("📊 Weekly volume per muscle group")
    analytics_df["week"] = analytics_df["date"].dt.to_period("W").astype(str)
    weekly_volume = analytics_df.groupby(["week", "muscle_group"])["volume"].sum().unstack(fill_value=0)
    st.bar_chart(weekly_volume)

    # ---- Muscle group heatmap (anatomy diagram) ----
    st.subheader("🫀 Muscle group heatmap")

    time_window_label = st.selectbox(
        "Time window",
        ["This Week (last 7 days)", "Last 30 Days", "All Time"]
    )
    window_map = {"This Week (last 7 days)": 7, "Last 30 Days": 30, "All Time": None}
    time_window_days = window_map[time_window_label]

    heatmap_df = analytics_df.copy()
    if time_window_days is not None:
        cutoff = pd.Timestamp.today().normalize() - pd.Timedelta(days=time_window_days)
        heatmap_df = heatmap_df[heatmap_df["date"] >= cutoff]

    volume_by_group = heatmap_df.groupby("muscle_group")["volume"].sum()
    max_volume = volume_by_group.max() if not volume_by_group.empty else 0

    cmap = colormaps["Blues"]
    muscle_colors = {}
    for group in MUSCLE_GROUPS:
        vol = volume_by_group.get(group, 0)
        if max_volume == 0 or vol == 0:
            muscle_colors[group] = "#E0E0E0"  # not trained in this window
        else:
            # 0.3 floor keeps even low volume visibly blue instead of near-white
            normalized = 0.3 + 0.7 * (vol / max_volume)
            muscle_colors[group] = mcolors.to_hex(cmap(normalized))

    body_svg = f"""
    <svg viewBox="0 0 460 280" xmlns="http://www.w3.org/2000/svg" style="width:100%; max-width:520px;">
      <text x="100" y="18" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">FRONT</text>
      <circle cx="100" cy="42" r="20" fill="#D9D9D9" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="64" cy="78" rx="20" ry="13" fill="{muscle_colors['Shoulders']}" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="136" cy="78" rx="20" ry="13" fill="{muscle_colors['Shoulders']}" stroke="#333" stroke-width="1.5"/>
      <rect x="72" y="68" width="56" height="42" rx="8" fill="{muscle_colors['Chest']}" stroke="#333" stroke-width="1.5"/>
      <rect x="76" y="108" width="48" height="36" rx="6" fill="{muscle_colors['Core']}" stroke="#333" stroke-width="1.5"/>
      <rect x="40" y="80" width="17" height="80" rx="8" fill="{muscle_colors['Arms']}" stroke="#333" stroke-width="1.5"/>
      <rect x="143" y="80" width="17" height="80" rx="8" fill="{muscle_colors['Arms']}" stroke="#333" stroke-width="1.5"/>
      <rect x="74" y="146" width="22" height="90" rx="8" fill="{muscle_colors['Legs']}" stroke="#333" stroke-width="1.5"/>
      <rect x="104" y="146" width="22" height="90" rx="8" fill="{muscle_colors['Legs']}" stroke="#333" stroke-width="1.5"/>

      <text x="360" y="18" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">BACK</text>
      <circle cx="360" cy="42" r="20" fill="#D9D9D9" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="324" cy="78" rx="20" ry="13" fill="{muscle_colors['Shoulders']}" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="396" cy="78" rx="20" ry="13" fill="{muscle_colors['Shoulders']}" stroke="#333" stroke-width="1.5"/>
      <rect x="332" y="68" width="56" height="76" rx="8" fill="{muscle_colors['Back']}" stroke="#333" stroke-width="1.5"/>
      <rect x="300" y="80" width="17" height="80" rx="8" fill="{muscle_colors['Arms']}" stroke="#333" stroke-width="1.5"/>
      <rect x="403" y="80" width="17" height="80" rx="8" fill="{muscle_colors['Arms']}" stroke="#333" stroke-width="1.5"/>
      <rect x="334" y="146" width="22" height="90" rx="8" fill="{muscle_colors['Legs']}" stroke="#333" stroke-width="1.5"/>
      <rect x="364" y="146" width="22" height="90" rx="8" fill="{muscle_colors['Legs']}" stroke="#333" stroke-width="1.5"/>
    </svg>
    """

    st.markdown(body_svg, unsafe_allow_html=True)
    st.caption(
        "Darker blue = more volume trained in the selected window. Grey = not trained yet. "
        + " • ".join(f"{g}: {volume_by_group.get(g, 0):.0f}kg" for g in MUSCLE_GROUPS)
    )
else:
    st.info("Log a few sets to unlock analytics.")