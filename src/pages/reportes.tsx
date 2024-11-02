import React, { useState } from "react";
import axios from "axios";

const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/doc-intel/upload_doc_intel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setResponse(res.data);
            alert("Document processed successfully.");
        } catch (error) {
            console.error("Error uploading document:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                alert(`Error processing document: ${error.response.data.detail || 'Unknown error'}`);
            } else {
                alert("Error processing document.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: "40px",
            backgroundColor: "#f7f9fc",
            borderRadius: "10px",
            maxWidth: "600px",
            margin: "auto",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
        }}>
            <h2 style={{
                textAlign: "center",
                color: "#34495e",
                marginBottom: "20px",
                fontWeight: "bold"
            }}>Upload Document</h2>

            <div style={{
                textAlign: "center",
                marginBottom: "20px",
            }}>
                <input type="file" onChange={handleFileChange} style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#ecf0f1",
                    cursor: "pointer"
                }} />
            </div>

            <div style={{ textAlign: "center" }}>
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    style={{
                        padding: "12px 25px",
                        backgroundColor: loading ? "#95a5a6" : "#2980b9",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)"
                    }}
                >
                    {loading ? "Uploading..." : "Upload Document"}
                </button>
            </div>

            {response && (
                <div style={{
                    marginTop: "30px",
                    padding: "20px",
                    backgroundColor: "#ecf0f1",
                    borderRadius: "8px",
                    color: "#34495e"
                }}>
                    <h3 style={{
                        textAlign: "center",
                        color: "#2980b9",
                        fontWeight: "bold"
                    }}>Document Data</h3>
                    <pre style={{
                        fontSize: "14px",
                        lineHeight: "1.6",
                        maxHeight: "200px",
                        overflowY: "auto",
                        backgroundColor: "#ffffff",
                        padding: "15px",
                        borderRadius: "5px"
                    }}>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
