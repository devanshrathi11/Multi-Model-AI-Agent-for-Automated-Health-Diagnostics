def synthesize_findings(row):
    findings = []

   
    for col in [
        'Hemoglobin_status','Glucose_status','TotalCholesterol_status','LDL_status',
        'HDL_status','Triglycerides_status','Creatinine_status','Urea_status','TSH_status','VitaminD_status'
    ]:
        status = row[col]
        if status in ('Low','High'):
            pretty = col.replace('_status','').replace('_',' ')
            findings.append(f'{pretty}: {status}')

    
    findings.extend(row['PatternFlags'])

   
    findings.extend(row['ContextNotes'])

  
    seen = set()
    unique_findings = []
    for f in findings:
        if f not in seen:
            seen.add(f)
            unique_findings.append(f)
    return unique_findings

df['Findings'] = df.apply(synthesize_findings, axis=1)
df[['PatientID','Findings']].head()
