def build_report_row(row): 
    return {
        'PatientID': row['PatientID'],
        'Age': row['Age'],
        'Gender': row['Gender'],
        'KeyMetrics': {
            'FastingGlucose_mgdl': row['FastingGlucose_mgdl'],
            'TotalCholesterol_mgdl': row['TotalCholesterol_mgdl'],
            'LDL_mgdl': row['LDL_mgdl'],
            'HDL_mgdl': row['HDL_mgdl'],
            'Triglycerides_mgdl': row['Triglycerides_mgdl'],
            'Creatinine_mgdl': row['Creatinine_mgdl'],
            'Urea_mgdl': row['Urea_mgdl'],
            'TSH_uIUml': row['TSH_uIUml'],
            'VitaminD_ngml': row['VitaminD_ngml'],
        },
        'Findings': row['Findings'],
        'Recommendations': row['Recommendations'],
        'Disclaimer': 'This AI-generated summary provides general information and is not a substitute for professional medical advice.'
    }

reports_series = df.apply(build_report_row, axis=1)
reports_df = pd.DataFrame(list(reports_series))
reports_df.to_csv('final_health_reports.csv', index=False)
print("Saved final_health_reports.csv with", len(reports_df), "rows.")
reports_df.head(3)
