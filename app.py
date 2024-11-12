from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Define the milestones and rewards
milestones = [
    { "minutes": 100, "reward": "10% off voucher" },
    { "minutes": 200, "reward": "20% off voucher" },
    { "minutes": 300, "reward": "Free smoothie" },
    { "minutes": 500, "reward": "Free gym membership for a month" }
]

# Initialize total minutes
total_minutes = 0

@app.route('/', methods=['GET', 'POST'])
def index():
    global total_minutes
    if request.method == 'POST':
        try:
            minutes = int(request.form['minutes'])
            if minutes > 0:
                total_minutes += minutes
                flash(f"Logged {minutes} minutes. Total minutes: {total_minutes}", 'success')
                check_milestones()
            else:
                flash("Please enter a valid number of minutes.", 'error')
        except ValueError:
            flash("Please enter a valid number of minutes.", 'error')
        return redirect(url_for('index'))
    return render_template('index.html', total_minutes=total_minutes)

def check_milestones():
    for milestone in milestones:
        if total_minutes >= milestone["minutes"]:
            flash(f"Milestone Reached! You have reached {milestone['minutes']} minutes of exercise. Reward: {milestone['reward']}", 'info')

if __name__ == '__main__':
    app.run(debug=True)

