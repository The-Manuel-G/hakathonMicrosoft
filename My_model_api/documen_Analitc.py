import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import DocumentAnalysisFeature, AnalyzeResult

# Connection
load_dotenv()
DOC_INT_ENDPOINT = os.getenv("DOC_INT_ENDPOINT")
DOC_INT_KEY = os.getenv("DOC_INT_KEY")
if not DOC_INT_ENDPOINT or not DOC_INT_KEY:
    raise ValueError("Environment variable document_intelligence endpoint or doc_int key not found.")

credential = AzureKeyCredential(DOC_INT_KEY)
document_intelligence_client = DocumentIntelligenceClient(DOC_INT_ENDPOINT, credential)

app = FastAPI()
@app.post("/upload_doc_intel")
async def upload_image(file: UploadFile = File(...)):
    try:
        query_fields = ['name', 'id', 'id_type', 'email', 'phone', 'medications', 'allergies', 'diagnosis', 'treatment_plan']

        poller = document_intelligence_client.begin_analyze_document(
            "prebuilt-layout",
            analyze_request=file.file,
            content_type="application/octet-stream",
            features=[DocumentAnalysisFeature.QUERY_FIELDS],
            query_fields=query_fields
        )

        result: AnalyzeResult = poller.result()

        final_doc_result = {}
        if result.documents:
            if result.documents[0].fields:
                for field in result.documents[0].fields.keys():
                    final_doc_result[field] = result.documents[0].fields[field].content
        else:
            return "User data not found"

        if result.tables:
            final_table_result = {}
            tables = result.tables
            for table in tables:
                if table.row_count == 8:
                    cells = table.cells
                    iterator = iter(cells)
                    while True:
                        try:
                            cell = next(iterator)
                        except:
                            break
                        selection = next(iterator).content
                        if ':selected:' in selection:
                            final_table_result[cell.content] = True
                        else:
                            final_table_result[cell.content] = False
                        next(iterator)

        if final_doc_result:
            import os
            from dotenv import load_dotenv
            from azure.data.tables import TableServiceClient
            from azure.core.credentials import AzureNamedKeyCredential

            load_dotenv()

            TABLE_ACCESS_KEY = os.getenv("TABLE_ACCESS_KEY")
            if not TABLE_ACCESS_KEY:
                raise ValueError("Environment table key variable not found.")
            table_credential = AzureNamedKeyCredential("lunger1life", TABLE_ACCESS_KEY)
            with TableServiceClient(endpoint="https://lunger1life.table.core.windows.net/", credential=table_credential
            ) as table_service_client:
                table_name = 'LungerLifePatient'
                table_client = table_service_client.get_table_client(table_name)
    
                my_entity = {
                    'PartitionKey': final_doc_result['id_type'],
                    'RowKey': final_doc_result['id'],
                    'name': final_doc_result['name'],
                    'email': final_doc_result['email'],
                    'phone': final_doc_result['phone'],
                    'id': final_doc_result['id'],
                    'id_type': final_doc_result['id_type'],
                    'allergies': final_doc_result['allergies'],
                    'diagnosis': final_doc_result['diagnosis'],
                    'medications': final_doc_result['medications'],
                    'treatment_plan': final_doc_result['treatment_plan'],
                    'smokes': final_table_result['Smokes'],
                    'drinks_alcohol': final_table_result['Drinks alcohol'],
                    'experiencing_fatigue': final_table_result['Experiencing fatigue'],
                    'chest_pain': final_table_result['Chest Pain'],
                    'difficulty_breathing': final_table_result['Difficulty breathing'],
                    'cough': final_table_result['Cough'],
                    'difficulty_swallowing': final_table_result['Difficulty swallowing'],
                    'feeling_breathless': final_table_result['Feeling breathless']}
                try:
                    table_client.upsert_entity(entity=my_entity)
                    print("Entity inserted/updated successfully.")
                except Exception as e:
                    print(f"Error inserting entity: {e}")
                    
                entities = table_client.list_entities()
                for entity in entities:
                    print(entity)
        else:
            return "User data not found"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")