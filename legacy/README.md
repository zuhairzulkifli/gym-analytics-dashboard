#Gym Analytics Dashboard

A full-stack workout tracking web app that goes beyond simple set logging into genuine training analytics, built with Python and Streamlit, applying statistical process control (SPC) methodology from a semiconductor manufacturing background to strength training data.

![Python](https://img.shields.io/badge/Python-3.x-blue)
![Streamlit](https://img.shields.io/badge/Streamlit-App-red)
![License](https://img.shields.io/badge/License-MIT-green)

## Why this exists

Most gym trackers log numbers. This one treats a training program the way a quality engineer treats a manufacturing process: is progress trending, stable, or genuinely out of control? It's a personal training tool built to apply real SPC and reliability-engineering methodology, the same kind used to monitor equipment performance and catch process drift in a fab, to something I track every week: my own lifts.

## Features

- **Live workout mode** - start a session, track it with a real-time timer, log sets as you go
- **Flexible manual logging** - backfill a session you forgot to track live
- **Auto-categorized exercise database** - barbell (SBD), machines, and bodyweight/calisthenics movements, each pre-mapped to the correct muscle group
- **Session-based history** - sets are grouped by workout ("Upper Body — July 9"), with an expandable view and per-set delete
- **Estimated 1RM trend** - tracks strength progression per exercise using the Epley formula
- **Weekly training volume by muscle group** - spot imbalances in programming at a glance
- **Anatomical muscle heatmap** - a custom SVG body diagram shaded by training volume, so neglected muscle groups are visually obvious, with selectable time windows (week / month / all-time)
- **Persistent local storage** - all data saved to CSV, survives restarts

## Screenshots

## Tech stack

- **Frontend/App framework:** [Streamlit](https://streamlit.io)
- **Data handling:** Pandas
- **Analytics/visualization:** Matplotlib, NumPy
- **Storage:** CSV (local file-based persistence)

## Quick start

```bash
# Clone the repo
git clone https://github.com/yourusername/gym-analytics-dashboard.git
cd gym-analytics-dashboard

# Create and activate a virtual environment
python -m venv venv
source venv/Scripts/activate   # Windows (Git Bash)
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
```

The app opens automatically at `http://localhost:8501`.

## Project structure

```
gym-analytics-dashboard/
├── app.py              # Main Streamlit application
├── data/
│   └── workouts.csv     # Logged workout data (generated on first run)
├── requirements.txt      # Python dependencies
└── README.md
```

## Roadmap

- [ ] Deploy live (Streamlit Community Cloud)
- [ ] Add automated tests for analytics functions
- [ ] Export session summaries as PDF/CSV reports
- [ ] Multi-user support

## Author

Built by Zuhair - www.linkedin.com/in/zuhair-zulkifli
