import ExcelJS from 'exceljs';

// Constants for Excel structure
const HEADER_SECTIONS = {
  BASIC_INFO: ['Door/Pin No.', 'Floor', 'Room', 'Location', 'Door Type', 'Door Material', 'Fire Rating', 'Third Party Certification', 'Surveyed', 'Flagged for Review'],
  DOOR_CONFIG: ['Door Set Configuration', 'Fan Light', 'Side Panels', 'VP Panel'],
  MEASUREMENTS: ['Leaf Thickness (mm)', 'Hinge Side Gap', 'Top Gap', 'Leading Edge', 'Threshold Gap'],
  CONDITION_ASSESSMENT: [
    'Frame Condition',
    'Frame Defects',
    'Leaf Condition',
    'Leaf Defects',
    'Alignment Condition',
    'Alignment Defects',
    'Handles Condition',
    'Handles Defects',
    'Lock Condition',
    'Lock Defects',
    'Signage Condition',
    'Signage Defects',
    'Hinges Condition',
    'Hinges Defects',
    'Threshold Condition',
    'Threshold Defects',
    'Seals Condition',
    'Seals Defects',
    'Closer Condition',
    'Closer Defects',
    'Furniture Condition',
    'Furniture Defects',
    'Glazing Condition',
    'Glazing Defects'
  ],
  FINAL_ASSESSMENT: ['Overall Condition', 'Upgrade/Replacement Required', 'Additional Notes']
};

// Helper function to format defects array into string
const formatDefects = (defects) => {
  if (!defects || !Array.isArray(defects)) return '';
  return defects.join(', ');
};

// Helper function to format condition value
const formatCondition = (condition) => {
  if (!condition) return 'Not Assessed';
  return condition;
};

// Main export function
const exportToExcel = async (surveys) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Fire Door Surveys');

  // Define the headers (rows in transposed format)
  const headers = [
    'Door/Pin No.',
    'Floor',
    'Room',
    'Location',
    'Door Type',
    'Door Material',
    'Fire Rating',
    'Third Party Certification',
    'Surveyed',
    'Flagged for Review',
    'Door Configuration',
    'Fan Light',
    'Side Panels',
    'VP Panel',
    'Leaf Thickness (mm)',
    'Hinge Side Gap',
    'Top Gap',
    'Leading Edge',
    'Threshold Gap',
    'Frame Condition',
    'Frame Defects',
    'Leaf Condition',
    'Leaf Defects',
    'Alignment',
    'Alignment Defects',
    'Handles Condition',
    'Handles Defects',
    'Lock Condition',
    'Lock Defects',
    'Signage Condition',
    'Signage Defects',
    'Hinges Condition',
    'Hinges Defects',
    'Threshold Condition',
    'Threshold Defects',
    'Seals Condition',
    'Seals Defects',
    'Closer Condition',
    'Closer Defects',
    'Furniture Condition',
    'Furniture Defects',
    'Glazing Condition',
    'Glazing Defects',
    'Overall Condition',
    'Action Required',
    'Notes'
  ];

  // Add headers as first column
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(index + 1, 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  // Add data in transposed format (each survey becomes a column)
  surveys.forEach((survey, colIndex) => {
    const col = colIndex + 2; // Start from second column

    // Map survey data to match headers order
    const data = [
      survey.doorPinNo || '',
      survey.floor || '',
      survey.room || '',
      survey.locationOfDoorSet || '',
      survey.doorType || '',
      survey.doorMaterial?.type || '',
      survey.rating || '',
      survey.thirdPartyCertification?.type || '',
      survey.surveyed ? 'Yes' : 'No',
      survey.isFlagged ? 'Yes' : 'No',
      survey.doorConfiguration?.type || '',
      survey.doorConfiguration?.hasFanLight ? 'Yes' : 'No',
      survey.doorConfiguration?.hasSidePanels ? 'Yes' : 'No',
      survey.doorConfiguration?.hasVPPanel ? 'Yes' : 'No',
      survey.leafThickness || '',
      `${survey.leafGap?.hingeSide?.start || ''}-${survey.leafGap?.hingeSide?.end || ''}`,
      `${survey.leafGap?.topGap?.start || ''}-${survey.leafGap?.topGap?.end || ''}`,
      `${survey.leafGap?.leadingEdge?.start || ''}-${survey.leafGap?.leadingEdge?.end || ''}`,
      `${survey.leafGap?.thresholdGap?.start || ''}-${survey.leafGap?.thresholdGap?.end || ''}`,
      formatCondition(survey.frameCondition),
      formatDefects(survey.frameDefects),
      formatCondition(survey.leafCondition),
      formatDefects(survey.leafDefects),
      formatCondition(survey.alignment),
      formatDefects(survey.alignmentDefects),
      formatCondition(survey.handlesSufficient),
      formatDefects(survey.handlesDefects),
      formatCondition(survey.lockCondition),
      formatDefects(survey.lockDefects),
      formatCondition(survey.signageSatisfactory),
      formatDefects(survey.signageDefects),
      formatCondition(survey.hingesCondition),
      formatDefects(survey.hingesDefects),
      formatCondition(survey.thresholdSeal),
      formatDefects(survey.thresholdDefects),
      formatCondition(survey.sealsCondition || survey.combinedStripsCondition),
      formatDefects(survey.sealsDefects || survey.combinedStripsDefects),
      formatCondition(survey.closerCondition || survey.selfCloserCondition),
      formatDefects(survey.closerDefects || survey.selfCloserDefects),
      formatCondition(survey.furnitureCondition),
      formatDefects(survey.furnitureDefects),
      formatCondition(survey.glazingCondition || survey.glazingSufficient),
      formatDefects(survey.glazingDefects),
      survey.overallCondition || '',
      survey.upgradeReplacement || '',
      survey.conditionDetails?.notes || ''
    ];

    // Add data to column
    data.forEach((value, rowIndex) => {
      const cell = worksheet.getCell(rowIndex + 1, col);
      cell.value = value;

      // Style condition cells
      const header = headers[rowIndex];
      if (header.includes('Condition') || header.includes('Sufficient') || header.includes('Satisfactory')) {
        if (value === 'No' || value === false) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF9999' }  // Light red
          };
        } else if (value === 'Yes' || value === true) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF99FF99' }  // Light green
          };
        }
      }
    });

    // Style flagged surveys
    if (survey.isFlagged) {
      worksheet.getColumn(col).eachCell(cell => {
        if (!cell.fill) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE0E0' }  // Light red background
          };
        }
      });
    }
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 30;  // Fixed width for better readability in transposed format
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  
  // Create download link and trigger download
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const link = document.createElement('a');
  link.href = url;
  link.download = `fire_door_surveys_${timestamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true };
};

// Function to apply Excel styling (if needed in future)
const applyExcelStyling = (ws) => {
  // This function can be expanded to add cell styling, colors, etc.
  // For now it's a placeholder for future styling needs
};

export default exportToExcel; 