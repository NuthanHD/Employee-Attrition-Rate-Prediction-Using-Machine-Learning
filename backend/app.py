from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

USE_SQLITE = os.getenv('USE_SQLITE', 'true').lower() == 'true'
DATABASE_URL = os.getenv('DATABASE_URL')

if USE_SQLITE:
    import sqlite3
    DATABASE = 'employee_attrition.db'
    print("Using SQLite database")
else:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    print("Using PostgreSQL database")

def get_db():
    if USE_SQLITE:
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        return conn
    else:
        # PostgreSQL connection
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
        else:
            conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'employee_attrition'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
        return conn

def get_cursor(conn):
    if USE_SQLITE:
        return conn.cursor()
    else:
        return conn.cursor(cursor_factory=RealDictCursor)

def get_placeholder():
    """Returns the correct placeholder for the database type"""
    return '?' if USE_SQLITE else '%s'

def row_to_dict(row):
    """Convert a database row to a dictionary"""
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    return dict(row)

def init_db():
    conn = get_db()
    cursor = get_cursor(conn)
    p = get_placeholder()
    
    if USE_SQLITE:
        # SQLite schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                employee_id TEXT NOT NULL,
                age INTEGER NOT NULL,
                department TEXT NOT NULL,
                job_role TEXT NOT NULL,
                monthly_income REAL NOT NULL,
                years_at_company INTEGER NOT NULL,
                gender TEXT NOT NULL,
                job_satisfaction INTEGER NOT NULL,
                marital_status TEXT NOT NULL,
                distance_from_home INTEGER NOT NULL,
                education TEXT NOT NULL,
                prediction TEXT NOT NULL,
                probability REAL NOT NULL,
                risk_level TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
    else:
        # PostgreSQL schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                employee_id VARCHAR(255) NOT NULL,
                age INTEGER NOT NULL,
                department VARCHAR(255) NOT NULL,
                job_role VARCHAR(255) NOT NULL,
                monthly_income DECIMAL(10, 2) NOT NULL,
                years_at_company INTEGER NOT NULL,
                gender VARCHAR(50) NOT NULL,
                job_satisfaction INTEGER NOT NULL,
                marital_status VARCHAR(50) NOT NULL,
                distance_from_home INTEGER NOT NULL,
                education VARCHAR(255) NOT NULL,
                prediction VARCHAR(10) NOT NULL,
                probability DECIMAL(5, 4) NOT NULL,
                risk_level VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

# ML Model
model = None
label_encoders = {}

def train_model():
    global model, label_encoders
    
    # Create synthetic training data for demonstration
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'Age': np.random.randint(22, 60, n_samples),
        'Department': np.random.choice(['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations'], n_samples),
        'JobRole': np.random.choice(['Software Engineer', 'Sales Executive', 'HR Manager', 'Marketing Analyst', 'Accountant', 'Operations Manager'], n_samples),
        'MonthlyIncome': np.random.randint(25000, 150000, n_samples),
        'YearsAtCompany': np.random.randint(0, 20, n_samples),
        'Gender': np.random.choice(['Male', 'Female'], n_samples),
        'JobSatisfaction': np.random.randint(1, 5, n_samples),
        'MaritalStatus': np.random.choice(['Single', 'Married', 'Divorced'], n_samples),
        'DistanceFromHome': np.random.randint(1, 30, n_samples),
        'Education': np.random.choice(['Below College', 'College', 'Bachelor', 'Master', 'Doctor'], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Create target variable based on realistic factors
    attrition_prob = (
        (df['JobSatisfaction'] < 2).astype(int) * 0.3 +
        (df['YearsAtCompany'] < 2).astype(int) * 0.2 +
        (df['MonthlyIncome'] < 40000).astype(int) * 0.2 +
        (df['DistanceFromHome'] > 20).astype(int) * 0.15 +
        (df['Age'] < 28).astype(int) * 0.15
    )
    
    df['Attrition'] = (attrition_prob + np.random.uniform(0, 0.3, n_samples) > 0.5).astype(int)
    
    # Encode categorical variables
    categorical_cols = ['Department', 'JobRole', 'Gender', 'MaritalStatus', 'Education']
    for col in categorical_cols:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Prepare features
    feature_cols = ['Age', 'MonthlyIncome', 'YearsAtCompany', 'JobSatisfaction', 'DistanceFromHome',
                    'Department_encoded', 'JobRole_encoded', 'Gender_encoded', 'MaritalStatus_encoded', 'Education_encoded']
    
    X = df[feature_cols]
    y = df['Attrition']
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    print("ML Model trained successfully!")

def predict_attrition(data):
    # Prepare input data
    try:
        dept_encoded = label_encoders['Department'].transform([data['department']])[0]
    except ValueError:
        dept_encoded = 0
    
    try:
        role_encoded = label_encoders['JobRole'].transform([data['job_role']])[0]
    except ValueError:
        role_encoded = 0
    
    try:
        gender_encoded = label_encoders['Gender'].transform([data['gender']])[0]
    except ValueError:
        gender_encoded = 0
    
    try:
        marital_encoded = label_encoders['MaritalStatus'].transform([data['marital_status']])[0]
    except ValueError:
        marital_encoded = 0
    
    try:
        edu_encoded = label_encoders['Education'].transform([data['education']])[0]
    except ValueError:
        edu_encoded = 0
    
    features = np.array([[
        data['age'],
        data['monthly_income'],
        data['years_at_company'],
        data['job_satisfaction'],
        data['distance_from_home'],
        dept_encoded,
        role_encoded,
        gender_encoded,
        marital_encoded,
        edu_encoded
    ]])
    
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]
    
    risk_level = 'Low'
    if probability > 0.7:
        risk_level = 'High'
    elif probability > 0.4:
        risk_level = 'Medium'
    
    return {
        'prediction': 'Yes' if prediction == 1 else 'No',
        'probability': round(probability, 4),
        'risk_level': risk_level
    }

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'message': 'Employee Attrition Prediction API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'register': '/api/register',
            'login': '/api/login',
            'predict': '/api/predict',
            'history': '/api/history',
            'charts': '/api/charts',
            'analysis': '/api/analysis',
            'admin_users': '/api/admin/users',
            'admin_stats': '/api/admin/stats'
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'database': 'PostgreSQL' if not USE_SQLITE else 'SQLite'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    p = get_placeholder()
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'SELECT id FROM users WHERE username = {p} OR email = {p}', (username, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username or email already exists'}), 400
    
    cursor.execute('SELECT COUNT(*) as count FROM users')
    row = cursor.fetchone()
    is_first_user = (row['count'] if isinstance(row, dict) else row[0]) == 0
    
    user_id = str(uuid.uuid4())
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    cursor.execute(f'''
        INSERT INTO users (id, username, email, password, is_admin)
        VALUES ({p}, {p}, {p}, {p}, {p})
    ''', (user_id, username, email, hashed_password, 1 if is_first_user else 0))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Registration successful',
        'user': {
            'id': user_id,
            'username': username,
            'email': email,
            'is_admin': is_first_user
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    p = get_placeholder()
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'SELECT * FROM users WHERE username = {p}', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user_dict = row_to_dict(user)
    if not bcrypt.check_password_hash(user_dict['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user_dict['id'],
            'username': user_dict['username'],
            'email': user_dict['email'],
            'is_admin': bool(user_dict['is_admin'])
        }
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    user_id = data.get('user_id')
    p = get_placeholder()
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    result = predict_attrition(data)
    
    prediction_id = str(uuid.uuid4())
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'''
        INSERT INTO predictions (id, user_id, employee_id, age, department, job_role, 
            monthly_income, years_at_company, gender, job_satisfaction, marital_status, 
            distance_from_home, education, prediction, probability, risk_level)
        VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
    ''', (
        prediction_id, user_id, data['employee_id'], data['age'], data['department'],
        data['job_role'], data['monthly_income'], data['years_at_company'], data['gender'],
        data['job_satisfaction'], data['marital_status'], data['distance_from_home'],
        data['education'], result['prediction'], result['probability'], result['risk_level']
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': prediction_id,
        **result
    }), 200

@app.route('/api/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    p = get_placeholder()
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'''
        SELECT * FROM predictions WHERE user_id = {p} ORDER BY created_at DESC
    ''', (user_id,))
    
    predictions = [row_to_dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(predictions), 200

@app.route('/api/history/<prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    p = get_placeholder()
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'DELETE FROM predictions WHERE id = {p}', (prediction_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Prediction deleted successfully'}), 200

@app.route('/api/charts', methods=['GET'])
def get_charts():
    user_id = request.args.get('user_id')
    p = get_placeholder()
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'SELECT * FROM predictions WHERE user_id = {p}', (user_id,))
    predictions = [row_to_dict(row) for row in cursor.fetchall()]
    conn.close()
    
    if not predictions:
        return jsonify({
            'department_data': [],
            'risk_distribution': [],
            'satisfaction_data': [],
            'income_attrition': [],
            'tenure_data': []
        }), 200
    
    # Department-wise attrition
    dept_data = {}
    for pred in predictions:
        dept = pred['department']
        if dept not in dept_data:
            dept_data[dept] = {'total': 0, 'attrition': 0}
        dept_data[dept]['total'] += 1
        if pred['prediction'] == 'Yes':
            dept_data[dept]['attrition'] += 1
    
    department_data = [{'department': k, 'total': v['total'], 'attrition': v['attrition']} for k, v in dept_data.items()]
    
    # Risk distribution
    risk_counts = {'Low': 0, 'Medium': 0, 'High': 0}
    for pred in predictions:
        risk_counts[pred['risk_level']] += 1
    risk_distribution = [{'name': k, 'value': v} for k, v in risk_counts.items()]
    
    # Satisfaction vs Attrition
    sat_data = {}
    for pred in predictions:
        sat = pred['job_satisfaction']
        if sat not in sat_data:
            sat_data[sat] = {'total': 0, 'attrition': 0}
        sat_data[sat]['total'] += 1
        if pred['prediction'] == 'Yes':
            sat_data[sat]['attrition'] += 1
    satisfaction_data = [{'satisfaction': k, 'total': v['total'], 'attrition': v['attrition']} for k, v in sorted(sat_data.items())]
    
    # Income vs Attrition (grouped)
    income_ranges = {'<30K': [0, 30000], '30K-50K': [30000, 50000], '50K-80K': [50000, 80000], '80K-100K': [80000, 100000], '>100K': [100000, float('inf')]}
    income_data = {k: {'total': 0, 'attrition': 0} for k in income_ranges.keys()}
    for pred in predictions:
        income = float(pred['monthly_income'])
        for range_name, (low, high) in income_ranges.items():
            if low <= income < high:
                income_data[range_name]['total'] += 1
                if pred['prediction'] == 'Yes':
                    income_data[range_name]['attrition'] += 1
                break
    income_attrition = [{'range': k, 'total': v['total'], 'attrition': v['attrition']} for k, v in income_data.items()]
    
    # Tenure data
    tenure_ranges = {'0-2 yrs': [0, 2], '2-5 yrs': [2, 5], '5-10 yrs': [5, 10], '10+ yrs': [10, 100]}
    tenure_data = {k: {'total': 0, 'attrition': 0} for k in tenure_ranges.keys()}
    for pred in predictions:
        years = pred['years_at_company']
        for range_name, (low, high) in tenure_ranges.items():
            if low <= years < high:
                tenure_data[range_name]['total'] += 1
                if pred['prediction'] == 'Yes':
                    tenure_data[range_name]['attrition'] += 1
                break
    tenure_result = [{'range': k, 'total': v['total'], 'attrition': v['attrition']} for k, v in tenure_data.items()]
    
    return jsonify({
        'department_data': department_data,
        'risk_distribution': risk_distribution,
        'satisfaction_data': satisfaction_data,
        'income_attrition': income_attrition,
        'tenure_data': tenure_result
    }), 200

@app.route('/api/analysis', methods=['GET'])
def get_analysis():
    user_id = request.args.get('user_id')
    p = get_placeholder()
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'SELECT * FROM predictions WHERE user_id = {p}', (user_id,))
    predictions = [row_to_dict(row) for row in cursor.fetchall()]
    conn.close()
    
    if not predictions:
        return jsonify({
            'summary': {
                'total_employees': 0,
                'at_risk': 0,
                'attrition_rate': 0,
                'avg_satisfaction': 0,
                'avg_tenure': 0,
                'avg_income': 0
            },
            'risk_factors': [],
            'recommendations': ['Start making predictions to see analysis'],
            'department_analysis': [],
            'satisfaction_analysis': []
        }), 200
    
    total = len(predictions)
    at_risk = sum(1 for pred in predictions if pred['prediction'] == 'Yes')
    avg_satisfaction = sum(pred['job_satisfaction'] for pred in predictions) / total
    avg_tenure = sum(pred['years_at_company'] for pred in predictions) / total
    avg_income = sum(float(pred['monthly_income']) for pred in predictions) / total
    
    risk_factors = []
    low_satisfaction = sum(1 for pred in predictions if pred['job_satisfaction'] < 3)
    if low_satisfaction > 0:
        risk_factors.append(f'{low_satisfaction} employees have low job satisfaction (below level 3)')
    
    low_tenure = sum(1 for pred in predictions if pred['years_at_company'] < 2)
    if low_tenure > 0:
        risk_factors.append(f'{low_tenure} employees have short tenure (less than 2 years)')
    
    low_income = sum(1 for pred in predictions if float(pred['monthly_income']) < 40000)
    if low_income > 0:
        risk_factors.append(f'{low_income} employees have below average income')
    
    far_distance = sum(1 for pred in predictions if pred['distance_from_home'] > 20)
    if far_distance > 0:
        risk_factors.append(f'{far_distance} employees have long commute (over 20 km)')
    
    young_employees = sum(1 for pred in predictions if pred['age'] < 28)
    if young_employees > 0:
        risk_factors.append(f'{young_employees} young employees (under 28) who may seek growth opportunities')
    
    recommendations = []
    attrition_rate = at_risk / total * 100
    
    if attrition_rate > 30:
        recommendations.append('High attrition rate detected. Consider immediate employee engagement programs.')
    if avg_satisfaction < 3:
        recommendations.append('Focus on improving job satisfaction through better work conditions and recognition.')
    if low_income > total * 0.3:
        recommendations.append('Review compensation packages to remain competitive.')
    if far_distance > total * 0.3:
        recommendations.append('Consider remote work or hybrid options for employees with long commutes.')
    if young_employees > total * 0.4:
        recommendations.append('Implement mentorship and career growth programs for younger employees.')
    if not recommendations:
        recommendations.append('Your workforce appears stable. Continue monitoring key metrics regularly.')
    
    dept_analysis = {}
    for pred in predictions:
        dept = pred['department']
        if dept not in dept_analysis:
            dept_analysis[dept] = {'total': 0, 'at_risk': 0, 'satisfaction_sum': 0, 'income_sum': 0}
        dept_analysis[dept]['total'] += 1
        dept_analysis[dept]['satisfaction_sum'] += pred['job_satisfaction']
        dept_analysis[dept]['income_sum'] += float(pred['monthly_income'])
        if pred['prediction'] == 'Yes':
            dept_analysis[dept]['at_risk'] += 1
    
    department_analysis = [{
        'department': k,
        'total_employees': v['total'],
        'at_risk': v['at_risk'],
        'attrition_rate': round(v['at_risk'] / v['total'] * 100, 1) if v['total'] > 0 else 0,
        'avg_satisfaction': round(v['satisfaction_sum'] / v['total'], 1) if v['total'] > 0 else 0,
        'avg_income': round(v['income_sum'] / v['total']) if v['total'] > 0 else 0
    } for k, v in dept_analysis.items()]
    
    sat_labels = {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'}
    sat_analysis = {}
    for pred in predictions:
        sat = pred['job_satisfaction']
        if sat not in sat_analysis:
            sat_analysis[sat] = {'count': 0, 'at_risk': 0}
        sat_analysis[sat]['count'] += 1
        if pred['prediction'] == 'Yes':
            sat_analysis[sat]['at_risk'] += 1
    
    satisfaction_analysis = [{
        'level': k,
        'label': sat_labels.get(k, 'Unknown'),
        'count': v['count'],
        'at_risk': v['at_risk'],
        'attrition_rate': round(v['at_risk'] / v['count'] * 100, 1) if v['count'] > 0 else 0
    } for k, v in sorted(sat_analysis.items())]
    
    return jsonify({
        'summary': {
            'total_employees': total,
            'at_risk': at_risk,
            'attrition_rate': round(attrition_rate, 1),
            'avg_satisfaction': round(avg_satisfaction, 1),
            'avg_tenure': round(avg_tenure, 1),
            'avg_income': round(avg_income)
        },
        'risk_factors': risk_factors,
        'recommendations': recommendations,
        'department_analysis': department_analysis,
        'satisfaction_analysis': satisfaction_analysis
    }), 200

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute('''
        SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
               (SELECT COUNT(*) FROM predictions WHERE user_id = u.id) as prediction_count
        FROM users u
    ''')
    
    users = [row_to_dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(users), 200

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    p = get_placeholder()
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute(f'DELETE FROM predictions WHERE user_id = {p}', (user_id,))
    cursor.execute(f'DELETE FROM users WHERE id = {p}', (user_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'User deleted successfully'}), 200

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    conn = get_db()
    cursor = get_cursor(conn)
    
    cursor.execute('SELECT COUNT(*) as count FROM users')
    row = cursor.fetchone()
    total_users = row['count'] if isinstance(row, dict) else row[0]
    
    cursor.execute('SELECT COUNT(*) as count FROM predictions')
    row = cursor.fetchone()
    total_predictions = row['count'] if isinstance(row, dict) else row[0]
    
    cursor.execute("SELECT COUNT(*) as count FROM predictions WHERE prediction = 'Yes'")
    row = cursor.fetchone()
    at_risk = row['count'] if isinstance(row, dict) else row[0]
    
    conn.close()
    
    return jsonify({
        'total_users': total_users,
        'total_predictions': total_predictions,
        'at_risk_employees': at_risk,
        'attrition_rate': round(at_risk / total_predictions * 100, 1) if total_predictions > 0 else 0
    }), 200

if __name__ == '__main__':
    init_db()
    train_model()
    print("Starting server on http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
