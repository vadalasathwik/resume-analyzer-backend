import fitz

def extract_text_from_pdf(file):
    pdf = fitz.open(stream=file.file.read(), filetype="pdf")

    text = ""
    for page in pdf:
        text += page.get_text()

    return text