import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_suggestion_email(visitor_email, suggestion_text):  
    if (outlook==true){
    smtp_server = "smtp-mail.outlook.com"
    } else if(gmail==true){
        smtp_server = "smtp.mail.gmail.com"
    }
    smtp_port = 587
    username = "your_email@outlook.com"
    password = "YOUR_APP_PASSWORD"  

    recipients = ["143994@mtsd.org", "thaguy10113519@outlook.com"]

    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = ", ".join(recipients)
    msg['Reply-To'] = visitor_email  
    msg['Subject'] = "New Website Suggestion"

    body = f"You received a new suggestion:\n\n{suggestion_text}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls() 
        server.login(username, password)
        server.sendmail(username, recipients, msg.as_string())
        server.quit()
        print("Suggestion sent successfully!")
    except Exception as e:
        print(f"Failed to send suggestion email: {e}")
