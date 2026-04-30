import streamlit as st
import google.generativeai as genai
import os
import PyPDF2 as pdf
from dotenv import load_dotenv

load_dotenv() # Loads your API Key

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_gemini_response(input_text):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(input_text)
    return response.text

def input_pdf_text(uploaded_file):
    reader = pdf.PdfReader(uploaded_file)
    text = ""
    for page in range(len(reader.pages)):
        page = reader.pages[page]
        text += str(page.extract_text())
    return text

# Prompt for the ATS Model
input_prompt = """
As an experienced ATS (Applicant Tracking System), evaluate the resume against the job description.
Provide the match percentage, missing keywords, and a profile summary.
Resume: {text}
Job Description: {jd}

Output must be in this format:
{{"JD Match": "%", "MissingKeywords": [], "Profile Summary": ""}}
"""

## Streamlit UI
st.set_page_config(page_title="ATS Resume Expert")
st.header("ATS Tracking System")
jd = st.text_area("Paste the Job Description here:")
uploaded_file = st.file_uploader("Upload your resume (PDF)...", type=["pdf"])

if st.button("Submit"):
    if uploaded_file is not None:
        text = input_pdf_text(uploaded_file)
        formatted_prompt = input_prompt.format(text=text, jd=jd)
        response = get_gemini_response(formatted_prompt)
        st.subheader("The Result is:")
        st.write(response)