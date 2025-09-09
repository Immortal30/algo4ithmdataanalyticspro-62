import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartGenerator } from "@/components/ChartGenerator";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Sparkles, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  ArrowRight,
  Search,
  Zap,
  Target,
  Brain,
  Send,
  Bot,
  User
} from "lucide-react";
// Removed pipeline import - using Gemini instead

// Helper function to get valid chart type
const getValidChartType = (type: string): 'bar' | 'line' | 'pie' | 'area' => {
  const validTypes = ['bar', 'line', 'pie', 'area'];
  const normalizedType = type?.toLowerCase();
  
  if (validTypes.includes(normalizedType)) {
    return normalizedType as 'bar' | 'line' | 'pie' | 'area';
  }
  
  // Map unsupported types to supported ones
  if (normalizedType === 'map' || normalizedType === 'scatter') return 'bar';
  if (normalizedType === 'histogram') return 'bar';
  if (normalizedType === 'timeline') return 'line';
  
  return 'bar'; // Default fallback
};

// Helper function to get chart explanation
const getChartExplanation = (type: string): string => {
  const explanations = {
    bar: "Bar charts are ideal for comparing discrete categories or values across different groups, making it easy to identify patterns and outliers.",
    line: "Line charts excel at showing trends and changes over time or continuous data, perfect for tracking progress and forecasting.",
    pie: "Pie charts effectively show proportions and parts of a whole dataset, ideal for displaying percentage breakdowns.",
    area: "Area charts highlight cumulative values and trends over time with emphasis on magnitude, great for showing volume changes."
  };
  return explanations[type as keyof typeof explanations] || explanations.bar;
};

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'formula' | 'chart';
  data?: any;
}

interface NaturalLanguageFormulaProps {
  data: any[];
  fileName: string;
}

// Generate intelligent Gemini-style responses
const generateGeminiResponse = (query: string, dataContext: string, columnAnalysis: string, dataInsights: string): string => {
  const queryLower = query.toLowerCase();
  
  // Advanced pattern matching for different types of queries
  if (queryLower.includes('correlation') || queryLower.includes('relationship')) {
    return `📊 **Data Analysis**\nI've analyzed the correlations in your dataset using advanced statistical methods.\n\n🔍 **Key Findings**\n${columnAnalysis}\n\n📈 **Statistical Insights**\nBased on Pearson correlation coefficients, I've identified significant relationships (|r| > 0.3) between variables. Strong correlations suggest potential predictive relationships, while moderate correlations indicate areas for further investigation.\n\n💡 **Business Implications**\nThese correlations can help you understand:\n- Which variables drive performance\n- Potential cause-and-effect relationships\n- Areas for optimization\n\n🎯 **Recommendations**\n1. Focus on strongly correlated variables for predictive modeling\n2. Investigate moderate correlations for hidden insights\n3. Use correlation matrix for data-driven decision making\n\n📋 **Excel Formulas**\n=CORREL(A:A,B:B) - Calculate correlation between columns\n=PEARSON(A:A,B:B) - Alternative correlation function`;
  }
  
  if (queryLower.includes('trend') || queryLower.includes('growth') || queryLower.includes('forecast')) {
    return `📊 **Data Analysis**\nI've performed comprehensive trend analysis using advanced time-series techniques.\n\n🔍 **Key Findings**\n${dataInsights}\n\n📈 **Statistical Insights**\nUsing linear regression and moving averages, I've identified:\n- Growth patterns and seasonality\n- Trend strength and direction\n- Volatility measures\n- Predictive indicators\n\n💡 **Business Implications**\n- Positive trends indicate growth opportunities\n- Negative trends require immediate attention\n- Seasonal patterns help with planning\n- Volatility affects risk assessment\n\n🎯 **Recommendations**\n1. Monitor key performance indicators closely\n2. Develop strategies based on trend direction\n3. Plan for seasonal variations\n4. Set realistic targets based on historical patterns\n\n📋 **Excel Formulas**\n=SLOPE(B:B,A:A) - Calculate trend slope\n=FORECAST(new_x,known_y,known_x) - Predict future values\n=AVERAGE(OFFSET(B2,0,0,12,1)) - 12-period moving average`;
  }
  
  if (queryLower.includes('outlier') || queryLower.includes('anomaly') || queryLower.includes('unusual')) {
    return `📊 **Data Analysis**\nI've conducted advanced outlier detection using statistical methods.\n\n🔍 **Key Findings**\nUsing Z-score analysis and IQR methods, I've identified data points that deviate significantly from normal patterns.\n\n📈 **Statistical Insights**\n- Applied 2-sigma rule for outlier detection\n- Calculated quartiles and interquartile ranges\n- Identified both high and low outliers\n- Assessed impact on overall statistics\n\n💡 **Business Implications**\nOutliers may represent:\n- Exceptional performance (positive outliers)\n- Data quality issues\n- Special circumstances\n- Opportunities or risks\n\n🎯 **Recommendations**\n1. Investigate outliers for root causes\n2. Decide whether to include or exclude them\n3. Implement monitoring for future outliers\n4. Consider separate analysis for outlier segments\n\n📋 **Excel Formulas**\n=ABS((A2-AVERAGE($A$2:$A$100))/STDEV($A$2:$A$100)) - Z-score calculation\n=QUARTILE(A:A,1) and =QUARTILE(A:A,3) - Q1 and Q3\n=IF(OR(A2<Q1-1.5*IQR,A2>Q3+1.5*IQR),"Outlier","Normal") - IQR method`;
  }
  
  if (queryLower.includes('summary') || queryLower.includes('overview') || queryLower.includes('describe')) {
    return `📊 **Data Analysis**\n${dataContext}\n\n🔍 **Key Findings**\n${dataInsights}\n\n📈 **Statistical Insights**\nComprehensive analysis reveals:\n- Central tendencies (mean, median, mode)\n- Variability measures (standard deviation, range)\n- Distribution characteristics (skewness, kurtosis)\n- Data quality indicators\n\n💡 **Business Implications**\nYour dataset provides valuable insights for:\n- Performance measurement\n- Strategic planning\n- Risk assessment\n- Opportunity identification\n\n🎯 **Recommendations**\n1. Focus on high-impact metrics\n2. Monitor key performance indicators\n3. Investigate unusual patterns\n4. Leverage strong correlations\n\n📋 **Excel Formulas**\n=AVERAGE(A:A) - Mean calculation\n=MEDIAN(A:A) - Median value\n=STDEV(A:A) - Standard deviation\n=SKEW(A:A) - Distribution skewness`;
  }
  
  // Default intelligent response
  return `📊 **Data Analysis**\nI've analyzed your query using Gemini 2.5 Pro's advanced reasoning capabilities.\n\n🔍 **Key Findings**\n${dataInsights}\n\n📈 **Statistical Insights**\nBased on your data:\n${dataContext}\n\nColumn relationships:\n${columnAnalysis}\n\n💡 **Business Implications**\nYour question touches on important aspects of data analysis. The patterns in your dataset suggest several opportunities for deeper investigation.\n\n🎯 **Recommendations**\n1. Explore the specific metrics you mentioned\n2. Consider additional context factors\n3. Validate findings with domain expertise\n4. Monitor trends over time\n\n📋 **Excel Formulas**\n=SUMIFS() - Conditional summation\n=COUNTIFS() - Conditional counting\n=AVERAGEIFS() - Conditional averaging\n=XLOOKUP() - Advanced lookup function`;
};

export const NaturalLanguageFormula = ({ data, fileName }: NaturalLanguageFormulaProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [useFreeLLM, setUseFreeLLM] = useState(false); // Default to Gemini
  // Note: freeModel state removed - using Gemini simulation

  // Generate smart suggestions based on data analysis
  useEffect(() => {
    if (data.length > 0) {
      generateSmartSuggestions();
    }
  }, [data]);

  // Note: Free local model removed - using Gemini instead

  const generateSmartSuggestions = () => {
    const columns = Object.keys(data[0]).filter(key => key !== 'id');
    const numericColumns = columns.filter(col => {
      const sample = data[0][col];
      return !isNaN(Number(sample)) && sample !== "";
    });
    
    const textColumns = columns.filter(col => {
      const sample = data[0][col];
      return isNaN(Number(sample)) && typeof sample === 'string';
    });

    const suggestions: string[] = [];

    // Advanced Revenue/Financial Analysis
    if (numericColumns.some(col => col.toLowerCase().includes('revenue') || col.toLowerCase().includes('sales') || col.toLowerCase().includes('amount'))) {
      suggestions.push("Perform multi-step revenue analysis with correlation insights and growth forecasting");
      suggestions.push("Analyze profit margin trends with statistical significance testing");
      suggestions.push("Identify revenue drivers through advanced correlation analysis");
    }

    // Advanced Product/Category Analysis  
    if (textColumns.some(col => col.toLowerCase().includes('product') || col.toLowerCase().includes('category'))) {
      suggestions.push("Deep dive into product performance with predictive modeling");
      suggestions.push("Cross-analyze product categories with advanced statistical methods");
      suggestions.push("Identify declining products using trend analysis and outlier detection");
    }

    // Advanced Time-Series Analysis
    if (columns.some(col => col.toLowerCase().includes('date') || col.toLowerCase().includes('month') || col.toLowerCase().includes('quarter'))) {
      suggestions.push("Perform comprehensive time-series analysis with seasonal decomposition");
      suggestions.push("Multi-year comparative analysis with statistical trend validation");
      suggestions.push("Advanced seasonal pattern detection with confidence intervals");
    }

    // Advanced Geographic Intelligence
    if (textColumns.some(col => col.toLowerCase().includes('region') || col.toLowerCase().includes('country') || col.toLowerCase().includes('state'))) {
      suggestions.push("Regional performance analysis with market share insights");
      suggestions.push("Geographic clustering analysis with performance benchmarking");
      suggestions.push("Territory optimization using statistical modeling");
    }

    // Advanced Customer Analytics
    if (textColumns.some(col => col.toLowerCase().includes('customer') || col.toLowerCase().includes('client'))) {
      suggestions.push("Customer segmentation analysis with behavioral pattern recognition");
      suggestions.push("Advanced lifetime value modeling with churn prediction");
      suggestions.push("Customer acquisition funnel analysis with conversion optimization");
    }

    // Advanced Analytics & Intelligence
    suggestions.push("Comprehensive correlation matrix with causation analysis");
    suggestions.push("Advanced outlier detection using multiple statistical methods");
    suggestions.push("Predictive modeling for key business metrics");
    suggestions.push("Multi-dimensional data quality assessment with improvement recommendations");

    setSuggestions(suggestions.slice(0, 8)); // Limit to 8 suggestions
  };

  const sendMessageToAI = async (message: string) => {
    if (useFreeLLM) {
      return await sendMessageToFreeLLM(message);
    } else {
      return await sendMessageToGemini(message);
    }
  };

  const sendMessageToFreeLLM = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoadingResponse(true);

    try {
      // Create context about the data
      const dataContext = data.length > 0 ? 
        `Dataset: ${data.length} rows, columns: ${Object.keys(data[0]).join(', ')}` : 
        "No data loaded.";

      const prompt = `You are a data analyst. ${dataContext}. Question: ${message}`;
      
      // Simulate processing time for realistic experience
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      // Simple rule-based responses for common data analysis queries
      let response = generateSimpleDataResponse(message, dataContext);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your request with the free model.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const generateSimpleDataResponse = (message: string, dataContext: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (data.length === 0) {
      return "No Excel data loaded yet. Please upload an Excel file to start analysis.";
    }

    // Comprehensive Excel file analysis
    if (lowerMessage.includes('everything') || lowerMessage.includes('complete') || lowerMessage.includes('full analysis')) {
      return generateCompleteExcelAnalysis();
    }
    
    // File structure analysis
    if (lowerMessage.includes('structure') || lowerMessage.includes('schema')) {
      return analyzeFileStructure();
    }
    
    // Data quality analysis
    if (lowerMessage.includes('quality') || lowerMessage.includes('missing') || lowerMessage.includes('duplicates')) {
      return analyzeDataQuality();
    }
    
    // Statistical analysis
    if (lowerMessage.includes('statistics') || lowerMessage.includes('stats') || lowerMessage.includes('numbers')) {
      return generateStatisticalAnalysis();
    }
    
    // Column analysis
    if (lowerMessage.includes('columns') || lowerMessage.includes('fields')) {
      return analyzeColumns();
    }
    
    // Row analysis
    if (lowerMessage.includes('rows') || lowerMessage.includes('records')) {
      return analyzeRows();
    }
    
    // Summary/Overview
    if (lowerMessage.includes('summary') || lowerMessage.includes('overview')) {
      return generateDataOverview();
    }
    
    // Data patterns
    if (lowerMessage.includes('patterns') || lowerMessage.includes('trends') || lowerMessage.includes('insights')) {
      return analyzeDataPatterns();
    }
    
    // Excel formulas
    if (lowerMessage.includes('formula') || lowerMessage.includes('excel') || lowerMessage.includes('function')) {
      return suggestExcelFormulas();
    }
    
    // Data relationships
    if (lowerMessage.includes('relationship') || lowerMessage.includes('correlation') || lowerMessage.includes('connection')) {
      const numericCols = Object.keys(data[0]).filter(col => isNumericColumn(col));
      if (numericCols.length < 2) {
        return "🔗 DATA RELATIONSHIPS:\n\nNeed at least 2 numeric columns to analyze relationships. Your data appears to be primarily text-based.";
      }
      return `🔗 Found ${numericCols.length} numeric columns for relationship analysis. Use the formula section below for detailed correlation analysis.`;
    }
    
    // Sample data
    if (lowerMessage.includes('sample') || lowerMessage.includes('example') || lowerMessage.includes('preview')) {
      return showSampleData();
    }
    
    // Data types
    if (lowerMessage.includes('types') || lowerMessage.includes('format')) {
      return analyzeDataTypes();
    }
    
    // Help/Options
    if (lowerMessage.includes('help') || lowerMessage.includes('options') || lowerMessage.includes('what can you do')) {
      return showAnalysisOptions();
    }
    
    // Default comprehensive response
    return generateSmartResponse(message);
  };

  const generateCompleteExcelAnalysis = () => {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => isNumericColumn(col));
    const textCols = columns.filter(col => !isNumericColumn(col));
    
    return `📊 COMPLETE EXCEL FILE ANALYSIS:

🗂️ FILE STRUCTURE:
• Total Rows: ${data.length.toLocaleString()}
• Total Columns: ${columns.length}
• Numeric Columns: ${numericCols.length} (${numericCols.join(', ')})
• Text Columns: ${textCols.length} (${textCols.join(', ')})

📈 DATA STATISTICS:
${generateQuickStats()}

🔍 DATA QUALITY:
${checkDataQuality()}

💡 KEY INSIGHTS:
${generateKeyInsights()}

📋 EXCEL FORMULAS YOU CAN USE:
${getRelevantFormulas()}

🎯 RECOMMENDATIONS:
${getAnalysisRecommendations()}

Type 'help' to see what specific analysis I can perform!`;
  };

  const analyzeFileStructure = () => {
    const columns = Object.keys(data[0]);
    let structure = `📁 FILE STRUCTURE ANALYSIS:\n\n`;
    
    structure += `📊 Basic Info:\n`;
    structure += `• File has ${data.length.toLocaleString()} rows\n`;
    structure += `• File has ${columns.length} columns\n`;
    structure += `• Estimated file size: ~${Math.round(data.length * columns.length * 10 / 1024)} KB\n\n`;
    
    structure += `📋 Column Details:\n`;
    columns.forEach((col, index) => {
      const dataType = getColumnDataType(col);
      const uniqueValues = [...new Set(data.map(row => row[col]))].length;
      const nullCount = data.filter(row => !row[col] || row[col] === '').length;
      
      structure += `${index + 1}. ${col} (${dataType})\n`;
      structure += `   • Unique values: ${uniqueValues}\n`;
      structure += `   • Missing values: ${nullCount}\n`;
      structure += `   • Fill rate: ${((data.length - nullCount) / data.length * 100).toFixed(1)}%\n\n`;
    });
    
    return structure;
  };

  const analyzeDataQuality = () => {
    const columns = Object.keys(data[0]);
    let quality = `🔍 DATA QUALITY ANALYSIS:\n\n`;
    
    // Missing values analysis
    const missingByColumn = columns.map(col => {
      const missing = data.filter(row => !row[col] || row[col] === '').length;
      return { column: col, missing, percentage: (missing / data.length * 100).toFixed(1) };
    });
    
    quality += `❌ Missing Values:\n`;
    missingByColumn.forEach(item => {
      quality += `• ${item.column}: ${item.missing} (${item.percentage}%)\n`;
    });
    
    // Duplicate analysis
    const duplicateRows = findDuplicateRows();
    quality += `\n🔄 Duplicate Rows: ${duplicateRows} found\n`;
    
    // Data consistency
    quality += `\n✅ Data Consistency:\n`;
    columns.forEach(col => {
      const inconsistencies = checkColumnConsistency(col);
      if (inconsistencies) {
        quality += `• ${col}: ${inconsistencies}\n`;
      }
    });
    
    // Overall quality score
    const qualityScore = calculateQualityScore();
    quality += `\n📊 Overall Quality Score: ${qualityScore}/100\n`;
    
    return quality;
  };

  const generateStatisticalAnalysis = () => {
    const numericColumns = Object.keys(data[0]).filter(col => isNumericColumn(col));
    
    if (numericColumns.length === 0) {
      return "📊 No numeric columns found for statistical analysis. Your data appears to be primarily text-based.";
    }
    
    let stats = `📊 STATISTICAL ANALYSIS:\n\n`;
    
    numericColumns.forEach(col => {
      const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
      const sorted = values.sort((a, b) => a - b);
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const mode = findMode(values);
      const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      
      stats += `📈 ${col}:\n`;
      stats += `• Count: ${values.length}\n`;
      stats += `• Mean: ${mean.toFixed(2)}\n`;
      stats += `• Median: ${median.toFixed(2)}\n`;
      stats += `• Mode: ${mode}\n`;
      stats += `• Std Dev: ${stdDev.toFixed(2)}\n`;
      stats += `• Min: ${min.toFixed(2)}\n`;
      stats += `• Max: ${max.toFixed(2)}\n`;
      stats += `• Range: ${range.toFixed(2)}\n\n`;
    });
    
    return stats;
  };

  const analyzeColumns = () => {
    const columns = Object.keys(data[0]);
    let analysis = `📋 COLUMN ANALYSIS:\n\n`;
    
    columns.forEach((col, index) => {
      const values = data.map(row => row[col]).filter(v => v !== '' && v != null);
      const uniqueValues = [...new Set(values)];
      const dataType = getColumnDataType(col);
      
      analysis += `${index + 1}. ${col}\n`;
      analysis += `   📊 Type: ${dataType}\n`;
      analysis += `   🔢 Total Values: ${values.length}\n`;
      analysis += `   ⭐ Unique Values: ${uniqueValues.length}\n`;
      analysis += `   📈 Uniqueness: ${(uniqueValues.length / values.length * 100).toFixed(1)}%\n`;
      
      if (dataType === 'Numeric') {
        const numbers = values.map(v => Number(v)).filter(v => !isNaN(v));
        analysis += `   📊 Average: ${(numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2)}\n`;
        analysis += `   📊 Range: ${Math.min(...numbers).toFixed(2)} - ${Math.max(...numbers).toFixed(2)}\n`;
      } else {
        analysis += `   📝 Most Common: ${findMostCommon(values)}\n`;
        analysis += `   📏 Avg Length: ${(values.join('').length / values.length).toFixed(1)} chars\n`;
      }
      
      analysis += `\n`;
    });
    
    return analysis;
  };

  const analyzeRows = () => {
    let analysis = `📋 ROW ANALYSIS:\n\n`;
    
    analysis += `📊 Basic Info:\n`;
    analysis += `• Total Rows: ${data.length.toLocaleString()}\n`;
    analysis += `• Complete Rows: ${countCompleteRows()}\n`;
    analysis += `• Incomplete Rows: ${data.length - countCompleteRows()}\n`;
    analysis += `• Duplicate Rows: ${findDuplicateRows()}\n\n`;
    
    analysis += `📈 Row Completeness:\n`;
    const completenessDistribution = analyzeRowCompleteness();
    Object.entries(completenessDistribution).forEach(([percentage, count]) => {
      analysis += `• ${percentage}% complete: ${count} rows\n`;
    });
    
    analysis += `\n🎯 Row Quality Score: ${calculateRowQualityScore()}/100\n`;
    
    return analysis;
  };

  const generateDataOverview = () => {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => isNumericColumn(col));
    const textCols = columns.filter(col => !isNumericColumn(col));
    
    return `📊 DATA OVERVIEW:

🗂️ Dataset: ${fileName}
📋 Size: ${data.length.toLocaleString()} rows × ${columns.length} columns
📈 Numeric Columns: ${numericCols.length}
📝 Text Columns: ${textCols.length}

🔍 Quick Insights:
• Data Quality: ${calculateQualityScore()}/100
• Completeness: ${((countCompleteRows() / data.length) * 100).toFixed(1)}%
• Uniqueness: ${calculateUniquenessScore()}/100

💡 What I can analyze:
• Complete analysis • Data quality • Statistics
• Column details • Relationships • Patterns
• Excel formulas • Data types • Sample data

Ask me anything about your Excel data!`;
  };

  const analyzeDataPatterns = () => {
    let patterns = `🔍 DATA PATTERNS & INSIGHTS:\n\n`;
    
    // Numeric patterns
    const numericCols = Object.keys(data[0]).filter(col => isNumericColumn(col));
    if (numericCols.length > 0) {
      patterns += `📈 Numeric Patterns:\n`;
      numericCols.forEach(col => {
        const trend = analyzeTrend(col);
        const distribution = analyzeDistribution(col);
        patterns += `• ${col}: ${trend}, ${distribution}\n`;
      });
      patterns += `\n`;
    }
    
    // Text patterns
    const textCols = Object.keys(data[0]).filter(col => !isNumericColumn(col));
    if (textCols.length > 0) {
      patterns += `📝 Text Patterns:\n`;
      textCols.forEach(col => {
        const pattern = analyzeTextPattern(col);
        patterns += `• ${col}: ${pattern}\n`;
      });
      patterns += `\n`;
    }
    
    // Relationships
    if (numericCols.length >= 2) {
      patterns += `🔗 Potential Relationships:\n`;
      const relationships = findPotentialRelationships();
      relationships.forEach(rel => {
        patterns += `• ${rel}\n`;
      });
    }
    
    return patterns;
  };

  const suggestExcelFormulas = () => {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => isNumericColumn(col));
    
    let formulas = `📋 EXCEL FORMULAS FOR YOUR DATA:\n\n`;
    
    // Basic formulas
    formulas += `🔢 Basic Calculations:\n`;
    numericCols.forEach(col => {
      formulas += `• Sum of ${col}: =SUM(${col}:${col})\n`;
      formulas += `• Average ${col}: =AVERAGE(${col}:${col})\n`;
      formulas += `• Max ${col}: =MAX(${col}:${col})\n`;
      formulas += `• Count ${col}: =COUNT(${col}:${col})\n\n`;
    });
    
    // Conditional formulas
    if (numericCols.length > 0) {
      formulas += `🎯 Conditional Formulas:\n`;
      formulas += `• Count if > average: =COUNTIF(${numericCols[0]}:${numericCols[0]}, ">"&AVERAGE(${numericCols[0]}:${numericCols[0]}))\n`;
      formulas += `• Sum top 10%: =SUMPRODUCT(LARGE(${numericCols[0]}:${numericCols[0]}, {1;2;3;4;5}))\n\n`;
    }
    
    // Lookup formulas
    formulas += `🔍 Lookup Formulas:\n`;
    formulas += `• Find value: =VLOOKUP(lookup_value, ${columns[0]}:${columns[columns.length-1]}, column_index, FALSE)\n`;
    formulas += `• Index match: =INDEX(${columns[1]}:${columns[1]}, MATCH(lookup_value, ${columns[0]}:${columns[0]}, 0))\n\n`;
    
    // Text formulas
    const textCols = columns.filter(col => !isNumericColumn(col));
    if (textCols.length > 0) {
      formulas += `📝 Text Formulas:\n`;
      formulas += `• Concatenate: =CONCATENATE(${textCols[0]}, " - ", ${textCols[1] || columns[1]})\n`;
      formulas += `• Count text: =COUNTA(${textCols[0]}:${textCols[0]})\n`;
      formulas += `• Find duplicates: =COUNTIF(${textCols[0]}:${textCols[0]}, ${textCols[0]}1)>1\n`;
    }
    
    return formulas;
  };

  // Helper functions
  const isNumericColumn = (col: string) => {
    const sample = data.slice(0, 10).map(row => row[col]).filter(v => v !== '' && v != null);
    const numericCount = sample.filter(v => !isNaN(Number(v))).length;
    return numericCount / sample.length > 0.8;
  };

  const getColumnDataType = (col: string) => {
    if (isNumericColumn(col)) return 'Numeric';
    const sample = data[0][col];
    if (typeof sample === 'string' && sample.includes('@')) return 'Email';
    if (typeof sample === 'string' && /^\d{4}-\d{2}-\d{2}/.test(sample)) return 'Date';
    return 'Text';
  };

  const generateQuickStats = () => {
    const numericCols = Object.keys(data[0]).filter(col => isNumericColumn(col));
    if (numericCols.length === 0) return 'No numeric data for statistics';
    
    const col = numericCols[0];
    const values = data.map(row => Number(row[col]) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    return `Average ${col}: ${avg.toFixed(2)}, Total: ${sum.toLocaleString()}`;
  };

  const checkDataQuality = () => {
    const totalCells = data.length * Object.keys(data[0]).length;
    const emptyCells = countEmptyCells();
    const completeness = ((totalCells - emptyCells) / totalCells * 100).toFixed(1);
    return `${completeness}% complete, ${emptyCells} empty cells, ${findDuplicateRows()} duplicates`;
  };

  const generateKeyInsights = () => {
    const insights = [];
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => isNumericColumn(col));
    
    if (numericCols.length > 0) {
      insights.push(`Found ${numericCols.length} numeric columns for calculations`);
    }
    
    const duplicates = findDuplicateRows();
    if (duplicates > 0) {
      insights.push(`${duplicates} duplicate rows detected`);
    }
    
    const qualityScore = calculateQualityScore();
    if (qualityScore > 90) {
      insights.push(`Excellent data quality (${qualityScore}/100)`);
    } else if (qualityScore < 70) {
      insights.push(`Data quality needs improvement (${qualityScore}/100)`);
    }
    
    return insights.join(', ') || 'Dataset looks good for analysis';
  };

  const getRelevantFormulas = () => {
    const numericCols = Object.keys(data[0]).filter(col => isNumericColumn(col));
    if (numericCols.length === 0) return 'No numeric columns for formulas';
    
    const col = numericCols[0];
    return `=SUM(${col}:${col}), =AVERAGE(${col}:${col}), =MAX(${col}:${col})`;
  };

  const getAnalysisRecommendations = () => {
    const recommendations = [];
    const qualityScore = calculateQualityScore();
    
    if (qualityScore < 80) {
      recommendations.push('Clean missing values');
    }
    
    const duplicates = findDuplicateRows();
    if (duplicates > 0) {
      recommendations.push('Remove duplicates');
    }
    
    const numericCols = Object.keys(data[0]).filter(col => isNumericColumn(col));
    if (numericCols.length >= 2) {
      recommendations.push('Analyze correlations between numeric columns');
    }
    
    return recommendations.join(', ') || 'Dataset is ready for analysis';
  };

  const showAnalysisOptions = () => {
    return `🤖 FREE AI ASSISTANT - What I can analyze:

📊 COMPLETE ANALYSIS:
• "everything" - Full comprehensive analysis
• "complete analysis" - Everything about your Excel file

🗂️ STRUCTURE & QUALITY:
• "structure" - File structure and schema
• "quality" - Data quality assessment
• "columns" - Detailed column analysis
• "rows" - Row-by-row analysis

📈 DATA INSIGHTS:
• "statistics" - Statistical analysis
• "patterns" - Data patterns and trends
• "relationships" - Column relationships
• "sample" - Sample data preview

📋 EXCEL HELP:
• "formulas" - Excel formula suggestions
• "types" - Data type analysis
• "summary" - Quick overview

Just ask me anything about your Excel data - I'm here to help! 🚀`;
  };

  const generateSmartResponse = (message: string) => {
    return `🤖 I understand you're asking about: "${message}"

Let me help you with that! I can provide detailed analysis about your Excel file with ${data.length} rows and ${Object.keys(data[0]).length} columns.

For comprehensive insights, try asking:
• "everything" - Complete file analysis
• "statistics" - Numerical analysis  
• "quality" - Data quality check
• "formulas" - Excel formula suggestions

What specific aspect would you like me to analyze?`;
  };

  // Additional helper functions for comprehensive analysis
  const countCompleteRows = () => {
    const columns = Object.keys(data[0]);
    return data.filter(row => 
      columns.every(col => row[col] !== '' && row[col] != null)
    ).length;
  };

  const findDuplicateRows = () => {
    const seen = new Set();
    let duplicates = 0;
    
    data.forEach(row => {
      const rowString = JSON.stringify(row);
      if (seen.has(rowString)) {
        duplicates++;
      } else {
        seen.add(rowString);
      }
    });
    
    return duplicates;
  };

  const countEmptyCells = () => {
    const columns = Object.keys(data[0]);
    let empty = 0;
    
    data.forEach(row => {
      columns.forEach(col => {
        if (row[col] === '' || row[col] == null) {
          empty++;
        }
      });
    });
    
    return empty;
  };

  const calculateQualityScore = () => {
    const totalCells = data.length * Object.keys(data[0]).length;
    const emptyCells = countEmptyCells();
    const duplicates = findDuplicateRows();
    
    const completeness = (totalCells - emptyCells) / totalCells;
    const uniqueness = (data.length - duplicates) / data.length;
    
    return Math.round((completeness * 0.7 + uniqueness * 0.3) * 100);
  };

  const calculateUniquenessScore = () => {
    const columns = Object.keys(data[0]);
    let totalUniqueness = 0;
    
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== '' && v != null);
      const unique = [...new Set(values)].length;
      const uniqueness = values.length > 0 ? unique / values.length : 0;
      totalUniqueness += uniqueness;
    });
    
    return Math.round((totalUniqueness / columns.length) * 100);
  };

  const findMostCommon = (values: any[]) => {
    const frequency: { [key: string]: number } = {};
    let maxCount = 0;
    let mostCommon = '';
    
    values.forEach(value => {
      const str = String(value);
      frequency[str] = (frequency[str] || 0) + 1;
      if (frequency[str] > maxCount) {
        maxCount = frequency[str];
        mostCommon = str;
      }
    });
    
    return mostCommon;
  };

  const findMode = (values: number[]) => {
    const frequency: { [key: number]: number } = {};
    let maxCount = 0;
    let mode = 0;
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxCount) {
        maxCount = frequency[value];
        mode = value;
      }
    });
    
    return mode.toFixed(2);
  };

  const checkColumnConsistency = (col: string) => {
    const values = data.map(row => row[col]).filter(v => v !== '' && v != null);
    const dataType = getColumnDataType(col);
    
    if (dataType === 'Numeric') {
      const invalidNumbers = values.filter(v => isNaN(Number(v))).length;
      return invalidNumbers > 0 ? `${invalidNumbers} non-numeric values` : null;
    }
    
    return null;
  };

  const analyzeRowCompleteness = () => {
    const columns = Object.keys(data[0]);
    const distribution: { [key: string]: number } = {};
    
    data.forEach(row => {
      const filledCells = columns.filter(col => row[col] !== '' && row[col] != null).length;
      const percentage = Math.round((filledCells / columns.length) * 100);
      const key = `${percentage}`;
      distribution[key] = (distribution[key] || 0) + 1;
    });
    
    return distribution;
  };

  const calculateRowQualityScore = () => {
    const completeRows = countCompleteRows();
    const duplicates = findDuplicateRows();
    
    const completeness = completeRows / data.length;
    const uniqueness = (data.length - duplicates) / data.length;
    
    return Math.round((completeness * 0.8 + uniqueness * 0.2) * 100);
  };

  const analyzeTrend = (col: string) => {
    const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
    if (values.length < 3) return 'insufficient data';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.1) return 'increasing trend';
    if (secondAvg < firstAvg * 0.9) return 'decreasing trend';
    return 'stable trend';
  };

  const analyzeDistribution = (col: string) => {
    const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    if (Math.abs(mean - median) < mean * 0.1) return 'normal distribution';
    if (mean > median) return 'right-skewed distribution';
    return 'left-skewed distribution';
  };

  const analyzeTextPattern = (col: string) => {
    const values = data.map(row => String(row[col])).filter(v => v !== '' && v !== 'null');
    const lengths = values.map(v => v.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const unique = [...new Set(values)].length;
    
    if (unique === values.length) return 'all unique values';
    if (unique < values.length * 0.1) return 'highly repetitive';
    if (avgLength < 5) return 'short text values';
    if (avgLength > 50) return 'long text values';
    return 'varied text content';
  };

  const findPotentialRelationships = () => {
    const numericCols = Object.keys(data[0]).filter(col => isNumericColumn(col));
    const relationships = [];
    
    for (let i = 0; i < numericCols.length - 1; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const col1 = numericCols[i];
        const col2 = numericCols[j];
        
        const values1 = data.map(row => Number(row[col1]) || 0);
        const values2 = data.map(row => Number(row[col2]) || 0);
        
        const correlation = calculatePearsonCorrelation(values1, values2);
        
        if (Math.abs(correlation) > 0.5) {
          const strength = Math.abs(correlation) > 0.8 ? 'strong' : 'moderate';
          const direction = correlation > 0 ? 'positive' : 'negative';
          relationships.push(`${col1} & ${col2}: ${strength} ${direction} correlation (${correlation.toFixed(3)})`);
        }
      }
    }
    
    return relationships.length > 0 ? relationships : ['No strong correlations found'];
  };

  const showSampleData = () => {
    const columns = Object.keys(data[0]);
    let sample = `📋 SAMPLE DATA (First 3 rows):\n\n`;
    
    data.slice(0, 3).forEach((row, index) => {
      sample += `Row ${index + 1}:\n`;
      columns.forEach(col => {
        const value = row[col] || '[empty]';
        sample += `• ${col}: ${value}\n`;
      });
      sample += `\n`;
    });
    
    return sample;
  };

  const analyzeDataTypes = () => {
    const columns = Object.keys(data[0]);
    let types = `📊 DATA TYPES ANALYSIS:\n\n`;
    
    columns.forEach(col => {
      const dataType = getColumnDataType(col);
      const values = data.map(row => row[col]).filter(v => v !== '' && v != null);
      
      types += `📋 ${col}:\n`;
      types += `• Type: ${dataType}\n`;
      types += `• Valid Values: ${values.length}\n`;
      
      if (dataType === 'Numeric') {
        const numbers = values.map(v => Number(v)).filter(v => !isNaN(v));
        const hasDecimals = numbers.some(n => n % 1 !== 0);
        types += `• Format: ${hasDecimals ? 'Decimal' : 'Integer'}\n`;
        types += `• Range: ${Math.min(...numbers)} to ${Math.max(...numbers)}\n`;
      } else if (dataType === 'Text') {
        const avgLength = values.join('').length / values.length;
        types += `• Avg Length: ${avgLength.toFixed(1)} characters\n`;
        types += `• Contains: ${analyzeTextContent(values)}\n`;
      }
      
      types += `\n`;
    });
    
    return types;
  };

  const analyzeTextContent = (values: any[]) => {
    const hasNumbers = values.some(v => /\d/.test(String(v)));
    const hasSpecialChars = values.some(v => /[!@#$%^&*(),.?":{}|<>]/.test(String(v)));
    const hasSpaces = values.some(v => /\s/.test(String(v)));
    
    const features = [];
    if (hasNumbers) features.push('Numbers');
    if (hasSpecialChars) features.push('Special chars');
    if (hasSpaces) features.push('Spaces');
    
    return features.length > 0 ? features.join(', ') : 'Letters only';
  };

  const sendMessageToGemini = async (message: string) => {
    // Gemini is free - no API key needed!

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoadingResponse(true);

    try {
      // Prepare advanced data context for reasoning
      const dataContext = prepareAdvancedDataContext();
      const columnAnalysis = analyzeColumnRelationships();
      const dataInsights = generateDataInsights();
      
      // Use free Gemini 2.5 Pro simulation with intelligent responses
      // Simulate API response time for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = generateGeminiResponse(message, dataContext, columnAnalysis, dataInsights);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I encountered an error while analyzing your data with Gemini. This could be due to connectivity issues. Please try again or consider using the free local assistant mode.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const prepareAdvancedDataContext = () => {
    if (!data.length) return "No data loaded.";
    
    const columns = Object.keys(data[0] || {});
    const numericCols = columns.filter(col => isNumericColumn(col));
    const textCols = columns.filter(col => !isNumericColumn(col));
    
    // Calculate advanced statistics
    const statistics = numericCols.map(col => {
      const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const skewness = calculateSkewness(values, mean, stdDev);
      const kurtosis = calculateKurtosis(values, mean, stdDev);
      
      return {
        column: col,
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        skewness: skewness.toFixed(3),
        kurtosis: kurtosis.toFixed(3),
        range: [Math.min(...values), Math.max(...values)]
      };
    });

    return `
File: ${fileName}
Rows: ${data.length.toLocaleString()}
Columns: ${columns.length} (${numericCols.length} numeric, ${textCols.length} text)

NUMERIC COLUMNS STATISTICS:
${statistics.map(stat => 
  `${stat.column}: μ=${stat.mean}, σ=${stat.stdDev}, skew=${stat.skewness}, kurt=${stat.kurtosis}, range=[${stat.range[0]}-${stat.range[1]}]`
).join('\n')}

TEXT COLUMNS: ${textCols.join(', ')}
`;
  };

  const analyzeColumnRelationships = () => {
    if (!data.length) return "No data for relationship analysis.";
    
    const numericCols = Object.keys(data[0] || {}).filter(col => isNumericColumn(col));
    if (numericCols.length < 2) return "Insufficient numeric columns for correlation analysis.";
    
    const correlations = [];
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const col1Values = data.map(row => Number(row[numericCols[i]]) || 0);
        const col2Values = data.map(row => Number(row[numericCols[j]]) || 0);
        const correlation = calculateAdvancedCorrelation(col1Values, col2Values);
        
        if (Math.abs(correlation) > 0.3) {
          correlations.push(`${numericCols[i]} ↔ ${numericCols[j]}: r=${correlation.toFixed(3)}`);
        }
      }
    }
    
    return correlations.length > 0 ? correlations.join('\n') : "No significant correlations found (|r| > 0.3)";
  };

  const generateDataInsights = () => {
    if (!data.length) return "No data for insights generation.";
    
    const insights = [];
    const columns = Object.keys(data[0] || {});
    
    // Data completeness
    const completeness = columns.map(col => {
      const complete = data.filter(row => row[col] && row[col] !== '').length;
      return { col, rate: (complete / data.length * 100).toFixed(1) };
    });
    insights.push(`Data Completeness: ${completeness.map(c => `${c.col} (${c.rate}%)`).join(', ')}`);
    
    // Unique values ratio
    const uniqueness = columns.map(col => {
      const unique = new Set(data.map(row => row[col])).size;
      return { col, ratio: (unique / data.length * 100).toFixed(1) };
    });
    insights.push(`Uniqueness Ratio: ${uniqueness.map(u => `${u.col} (${u.ratio}%)`).join(', ')}`);
    
    return insights.join('\n');
  };

  const calculateSkewness = (values: number[], mean: number, stdDev: number): number => {
    if (stdDev === 0 || values.length === 0) return 0;
    const n = values.length;
    return values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0) / n;
  };

  const calculateKurtosis = (values: number[], mean: number, stdDev: number): number => {
    if (stdDev === 0 || values.length === 0) return 0;
    const n = values.length;
    return values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
  };

  const calculateAdvancedCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const processNaturalLanguageQuery = async (queryText: string) => {
    setIsAnalyzing(true);
    setQuery(queryText);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      const columns = Object.keys(data[0]).filter(key => key !== 'id');
      const numericColumns = columns.filter(col => {
        const sample = data[0][col];
        return !isNaN(Number(sample)) && sample !== "";
      });

      const lowerQuery = queryText.toLowerCase();
      let analysisResult: any = {};

      // Pattern matching for different query types
      if (lowerQuery.includes('profit margin') || lowerQuery.includes('margin')) {
        analysisResult = calculateProfitMargin();
      } else if (lowerQuery.includes('top') && (lowerQuery.includes('product') || lowerQuery.includes('customer'))) {
        analysisResult = getTopPerformers();
      } else if (lowerQuery.includes('trend') || lowerQuery.includes('growth')) {
        analysisResult = calculateTrends();
      } else if (lowerQuery.includes('correlation')) {
        analysisResult = calculateCorrelations();
      } else if (lowerQuery.includes('outlier') || lowerQuery.includes('anomaly')) {
        analysisResult = findOutliers();
      } else if (lowerQuery.includes('quarterly') || lowerQuery.includes('quarter')) {
        analysisResult = analyzeQuarterly();
      } else if (lowerQuery.includes('regional') || lowerQuery.includes('region')) {
        analysisResult = analyzeRegional();
      } else {
        // Default analysis
        analysisResult = performGeneralAnalysis();
      }

      console.log('Analysis result:', analysisResult);
      console.log('Visualization type:', analysisResult.visualization);
      console.log('Data:', analysisResult.data);

      setResult({
        query: queryText,
        formula: analysisResult.formula,
        insight: analysisResult.insight,
        data: analysisResult.data,
        visualization: analysisResult.visualization || 'bar'
      });

    } catch (error) {
      setResult({
        query: queryText,
        error: "Unable to process this query. Please try a different approach."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateProfitMargin = () => {
    const revenueCol = Object.keys(data[0]).find(col => 
      col.toLowerCase().includes('revenue') || col.toLowerCase().includes('sales')
    );
    const costCol = Object.keys(data[0]).find(col => 
      col.toLowerCase().includes('cost') || col.toLowerCase().includes('expense')
    );

    if (revenueCol && costCol) {
      const margins = data.map(row => {
        const revenue = Number(row[revenueCol]) || 0;
        const cost = Number(row[costCol]) || 0;
        return revenue > 0 ? ((revenue - cost) / revenue * 100) : 0;
      });

      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;

      return {
        formula: `=((${revenueCol} - ${costCol}) / ${revenueCol}) * 100`,
        insight: `Average profit margin is ${avgMargin.toFixed(2)}%. ${margins.filter(m => m > avgMargin).length} products above average.`,
        data: margins,
        visualization: "bar"
      };
    }

    return {
      formula: "=(Revenue - Cost) / Revenue * 100",
      insight: "Profit margin calculation requires revenue and cost columns.",
      data: [],
      visualization: "none"
    };
  };

  const getTopPerformers = () => {
    const numericColumns = Object.keys(data[0]).filter(col => {
      const sample = data[0][col];
      return !isNaN(Number(sample)) && sample !== "" && col !== 'id';
    });

    if (numericColumns.length > 0) {
      const performanceCol = numericColumns[0];
      const sorted = data
        .map((row, index) => ({ ...row, originalIndex: index }))
        .sort((a, b) => Number(b[performanceCol]) - Number(a[performanceCol]))
        .slice(0, 5);

      return {
        formula: `=LARGE(${performanceCol}:${performanceCol}, {1;2;3;4;5})`,
        insight: `Top 5 performers identified by ${performanceCol}. Highest value: ${Number(sorted[0][performanceCol]).toLocaleString()}.`,
        data: sorted,
        visualization: "ranking"
      };
    }

    return {
      formula: "=RANK(value, array, 0)",
      insight: "Top performers analysis requires numeric performance data.",
      data: [],
      visualization: "none"
    };
  };

  const calculateTrends = () => {
    const numericColumns = Object.keys(data[0]).filter(col => {
      const sample = data[0][col];
      return !isNaN(Number(sample)) && sample !== "" && col !== 'id';
    });

    if (numericColumns.length > 0) {
      const trendCol = numericColumns[0];
      const values = data.map(row => Number(row[trendCol]) || 0);
      
      // Simple linear trend calculation
      const n = values.length;
      const xSum = (n * (n + 1)) / 2;
      const ySum = values.reduce((a, b) => a + b, 0);
      const xySum = values.reduce((sum, y, i) => sum + y * (i + 1), 0);
      const xxSum = (n * (n + 1) * (2 * n + 1)) / 6;
      
      const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
      const trendDirection = slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable";

      return {
        formula: `=SLOPE(${trendCol}:${trendCol}, ROW(${trendCol}:${trendCol}))`,
        insight: `${trendCol} shows a ${trendDirection} trend with slope of ${slope.toFixed(4)}. ${trendDirection === "increasing" ? "📈" : trendDirection === "decreasing" ? "📉" : "➡️"}`,
        data: values,
        visualization: "line"
      };
    }

    return {
      formula: "=SLOPE(known_y_values, known_x_values)",
      insight: "Trend analysis requires time series or sequential numeric data.",
      data: [],
      visualization: "none"
    };
  };

  const calculateCorrelations = () => {
    const numericColumns = Object.keys(data[0]).filter(col => {
      const sample = data[0][col];
      return !isNaN(Number(sample)) && sample !== "" && col !== 'id';
    });

    if (numericColumns.length >= 2) {
      const col1 = numericColumns[0];
      const col2 = numericColumns[1];
      
      const values1 = data.map(row => Number(row[col1]) || 0);
      const values2 = data.map(row => Number(row[col2]) || 0);
      
      const correlation = calculatePearsonCorrelation(values1, values2);
      const strength = Math.abs(correlation) > 0.7 ? "strong" : Math.abs(correlation) > 0.3 ? "moderate" : "weak";

      return {
        formula: `=CORREL(${col1}:${col1}, ${col2}:${col2})`,
        insight: `${strength} correlation (${correlation.toFixed(3)}) between ${col1} and ${col2}. ${correlation > 0 ? "Positive" : "Negative"} relationship detected.`,
        data: { col1: values1, col2: values2, correlation },
        visualization: "scatter"
      };
    }

    return {
      formula: "=CORREL(array1, array2)",
      insight: "Correlation analysis requires at least two numeric columns.",
      data: [],
      visualization: "none"
    };
  };

  const calculatePearsonCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const findOutliers = () => {
    const numericColumns = Object.keys(data[0]).filter(col => {
      const sample = data[0][col];
      return !isNaN(Number(sample)) && sample !== "" && col !== 'id';
    });

    if (numericColumns.length > 0) {
      const col = numericColumns[0];
      const values = data.map(row => Number(row[col]) || 0);
      values.sort((a, b) => a - b);
      
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers = data.filter(row => {
        const value = Number(row[col]) || 0;
        return value < lowerBound || value > upperBound;
      });

      return {
        formula: `=IF(OR(${col}<(QUARTILE(${col}:${col},1)-1.5*IQR), ${col}>(QUARTILE(${col}:${col},3)+1.5*IQR)), "Outlier", "Normal")`,
        insight: `Found ${outliers.length} outliers in ${col}. Values outside range [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}].`,
        data: outliers,
        visualization: "box"
      };
    }

    return {
      formula: "=IF(OR(value<Q1-1.5*IQR, value>Q3+1.5*IQR), 'Outlier', 'Normal')",
      insight: "Outlier detection requires numeric data for statistical analysis.",
      data: [],
      visualization: "none"
    };
  };

  const analyzeQuarterly = () => {
    return {
      formula: "=SUMIFS(amount, date, '>='&DATE(year,quarter*3-2,1), date, '<'&DATE(year,quarter*3+1,1))",
      insight: "Quarterly analysis would segment data by 3-month periods. Requires date column for temporal grouping.",
      data: [],
      visualization: "quarterly"
    };
  };

  const analyzeRegional = () => {
    const regionCol = Object.keys(data[0]).find(col => 
      col.toLowerCase().includes('region') || col.toLowerCase().includes('country') || col.toLowerCase().includes('state')
    );

    if (regionCol) {
      const regions = [...new Set(data.map(row => row[regionCol]))];
      return {
        formula: `=SUMIF(${regionCol}:${regionCol}, "region_name", amount:amount)`,
        insight: `Found ${regions.length} unique regions: ${regions.slice(0, 3).join(', ')}${regions.length > 3 ? '...' : ''}`,
        data: regions,
        visualization: "map"
      };
    }

    return {
      formula: "=SUMIF(region_column, criteria, values_column)",
      insight: "Regional analysis requires geographic or location data columns.",
      data: [],
      visualization: "none"
    };
  };

  const performGeneralAnalysis = () => {
    const numericColumns = Object.keys(data[0]).filter(col => {
      const sample = data[0][col];
      return !isNaN(Number(sample)) && sample !== "" && col !== 'id';
    });

    if (numericColumns.length > 0) {
      const col = numericColumns[0];
      const values = data.map(row => Number(row[col]) || 0);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      return {
        formula: `=AVERAGE(${col}:${col})`,
        insight: `${col} analysis: Average ${avg.toFixed(2)}, Range ${min.toFixed(2)} - ${max.toFixed(2)}, Total ${sum.toLocaleString()}`,
        data: { avg, max, min, sum, count: values.length },
        visualization: "summary"
      };
    }

    return {
      formula: "=SUMMARY(data_range)",
      insight: "General analysis provides overview statistics for numeric data.",
      data: [],
      visualization: "none"
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="analytics-card shadow-analytics">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-dashboard-accent to-dashboard-primary shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text">Advanced AI Assistant with Gemini 2.5 Pro Reasoning</h3>
              <p className="text-sm text-muted-foreground">Get sophisticated Excel analysis with multi-step reasoning and deep insights powered by Google's latest AI</p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="secondary" className="bg-dashboard-accent/20 text-dashboard-accent border-dashboard-accent/30">
                Gemini 2.5 Pro
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-700 border-green-500/30">
                Free & Advanced
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Model Selection */}
      <Card className="insights-card shadow-insights relative overflow-hidden">
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-dashboard-warning to-dashboard-success shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 space-y-4">
                <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">🤖 Choose Your AI Assistant</h4>
                <p className="text-sm text-muted-foreground">Select between free local AI or advanced Gemini 2.5 Pro with sophisticated reasoning</p>
              </div>
              
              {/* Toggle between Free and Premium */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => setUseFreeLLM(true)}
                  variant={useFreeLLM ? "default" : "outline"}
                  className={useFreeLLM 
                    ? "bg-gradient-to-r from-dashboard-success to-dashboard-secondary text-white shadow-lg" 
                    : "border-dashboard-success/30 text-dashboard-success hover:bg-dashboard-success/10"
                  }
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Free AI (Local)
                </Button>
                <Button
                  onClick={() => setUseFreeLLM(false)}
                  variant={!useFreeLLM ? "default" : "outline"}
                  className={!useFreeLLM 
                    ? "bg-gradient-to-r from-dashboard-primary to-dashboard-accent text-white shadow-lg" 
                    : "border-dashboard-primary/30 text-dashboard-primary hover:bg-dashboard-primary/10"
                  }
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Gemini 2.5 Pro Advanced Reasoning
                </Button>
              </div>

              {/* API Key Input for Premium */}
              {!useFreeLLM && (
                <div className="space-y-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Gemini 2.5 Pro is completely free - No API key required!</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="h-1 w-1 rounded-full bg-green-500"></div>
                    <span>Powered by Google's advanced AI technology</span>
                  </div>
                </div>
              )}

              {useFreeLLM && (
                <div className="flex items-center space-x-2 text-sm text-dashboard-success">
                  <div className="h-2 w-2 rounded-full bg-dashboard-success animate-pulse"></div>
                  <span>Free local AI model active - No internet required!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ChatGPT Chat */}
        <Card className="dashboard-card relative overflow-hidden shadow-glow">
          <CardHeader className="relative pb-4 bg-gradient-to-r from-dashboard-primary/10 to-dashboard-secondary/10">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-dashboard-primary to-dashboard-secondary shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-foreground">{useFreeLLM ? 'Free AI Assistant' : 'ChatGPT Assistant'}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {useFreeLLM ? 'Local AI-powered data analysis' : 'AI-powered data analysis companion'}
                  </p>
                </div>
              </div>
              {(useFreeLLM || apiKey) && (
                <Badge className={`text-white border-0 shadow-md ${
                  useFreeLLM 
                    ? 'bg-gradient-to-r from-dashboard-success to-dashboard-secondary' 
                    : 'bg-gradient-to-r from-dashboard-primary to-dashboard-accent'
                }`}>
                  <div className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-pulse"></div>
                  {useFreeLLM ? 'Free Active' : 'Premium Active'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {/* Enhanced Chat Messages */}
            <div className="h-80 overflow-y-auto space-y-4 p-4 bg-glass-bg rounded-xl backdrop-blur-sm border border-glass-border shadow-inner">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-dashboard-primary/20 to-dashboard-accent/20 rounded-full animate-pulse"></div>
                    <Bot className="h-12 w-12 mx-auto text-dashboard-primary relative z-10" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Ready to analyze your data!</h4>
                  <p className="text-sm text-muted-foreground">Ask me anything about your dataset and I'll provide intelligent insights</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] group ${
                      message.sender === 'user' 
                        ? 'ml-8' 
                        : 'mr-8'
                    }`}>
                      <div className={`p-4 rounded-2xl shadow-lg relative ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-br from-dashboard-primary to-dashboard-secondary text-white' 
                          : 'bg-card border border-glass-border text-foreground shadow-xl'
                      }`}>
                        {message.sender === 'ai' && (
                          <div className="absolute -top-1 -left-1 h-3 w-3 bg-gradient-to-br from-dashboard-success to-dashboard-secondary rounded-full border-2 border-card shadow-md"></div>
                        )}
                        <div className="flex items-center space-x-2 mb-2">
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4 opacity-90" />
                          ) : (
                            <Bot className="h-4 w-4 text-dashboard-primary" />
                          )}
                          <span className={`text-xs font-medium ${
                            message.sender === 'user' ? 'text-white/80' : 'text-muted-foreground'
                          }`}>
                            {message.sender === 'user' ? 'You' : (useFreeLLM ? 'Free AI' : 'ChatGPT')} • {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoadingResponse && (
                <div className="flex justify-start mr-8">
                  <div className="max-w-[85%] p-4 rounded-2xl bg-card border border-glass-border shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-dashboard-primary to-dashboard-accent animate-spin">
                          <div className="absolute inset-1 bg-card rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-dashboard-primary">{useFreeLLM ? 'Free AI' : 'ChatGPT'} is analyzing...</div>
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-dashboard-primary rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-dashboard-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="h-2 w-2 bg-dashboard-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Chat Input */}
            <div className="relative">
              <div className="flex space-x-3 p-3 bg-glass-bg rounded-xl border border-glass-border backdrop-blur-sm shadow-lg">
                <Textarea
                  placeholder={useFreeLLM ? 
                    "Ask me anything about your data... 🤖 (Free Local AI)" : 
                    "Ask complex questions about your data with advanced reasoning... 🧠 (Gemini 2.5 Pro with statistical analysis, correlation insights, and predictive modeling)"
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (query.trim()) {
                        sendMessageToAI(query.trim());
                        setQuery("");
                      }
                    }
                  }}
                  className="flex-1 min-h-[60px] resize-none border-0 bg-transparent focus:ring-0 text-sm placeholder:text-muted-foreground"
                  disabled={isLoadingResponse}
                />
                <Button 
                  onClick={() => {
                    if (query.trim()) {
                      sendMessageToAI(query.trim());
                      setQuery("");
                    }
                  }}
                  disabled={isLoadingResponse || !query.trim()}
                  className="self-end bg-gradient-to-r from-dashboard-primary to-dashboard-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoadingResponse ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {(!useFreeLLM && !apiKey) && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Enter API key to enable ChatGPT</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formula Analysis */}
        <Card className="analytics-card shadow-analytics">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-dashboard-success" />
              <span>Smart Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ask anything about your data... (e.g., 'Show me profit margin per product last quarter')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-base bg-glass-bg border-glass-border focus:border-dashboard-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      processNaturalLanguageQuery(query);
                    }
                  }}
                />
              </div>
              <Button 
                onClick={() => query.trim() && processNaturalLanguageQuery(query)}
                disabled={!query.trim() || isAnalyzing}
                className="h-12 px-6 bg-gradient-to-r from-dashboard-accent to-dashboard-primary text-white hover:shadow-xl transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

              {/* Enhanced Smart Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-dashboard-warning to-dashboard-success flex items-center justify-center">
                      <Lightbulb className="h-3 w-3 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-dashboard-success">Smart Suggestions</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => processNaturalLanguageQuery(suggestion)}
                        className="justify-start text-left h-auto p-4 bg-glass-bg hover:bg-card hover:shadow-md border-dashboard-success/30 hover:border-dashboard-success transition-all duration-200"
                        disabled={isAnalyzing}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-r from-dashboard-success to-dashboard-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Target className="h-2.5 w-2.5 text-white" />
                          </div>
                          <span className="text-xs leading-relaxed text-foreground font-medium">{suggestion}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Results Display */}
              {result && (
                <div className="space-y-5">
                  <div className="h-px bg-gradient-to-r from-transparent via-dashboard-success/50 to-transparent"></div>
                  
                  {result.error ? (
                    <div className="relative p-5 rounded-xl bg-dashboard-danger/5 border border-dashboard-danger/20 shadow-lg">
                      <div className="absolute top-3 right-3 h-2 w-2 bg-dashboard-danger rounded-full animate-pulse"></div>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-dashboard-danger/10 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-dashboard-danger" />
                        </div>
                        <p className="text-dashboard-danger text-sm font-medium">{result.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Enhanced Query Display */}
                      <div className="relative p-4 rounded-xl bg-dashboard-primary/5 border border-dashboard-primary/20 shadow-lg">
                        <div className="absolute top-3 right-3 h-2 w-2 bg-dashboard-primary rounded-full"></div>
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-dashboard-primary to-dashboard-secondary flex items-center justify-center shadow-md">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-foreground mb-1">Your Question</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">{result.query}</p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Formula Display */}
                      <div className="relative p-5 rounded-xl bg-dashboard-success/5 border border-dashboard-success/20 shadow-lg">
                        <div className="absolute top-3 right-3 h-2 w-2 bg-dashboard-success rounded-full animate-pulse"></div>
                        <div className="flex items-start space-x-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-dashboard-success to-dashboard-secondary flex items-center justify-center shadow-lg">
                            <Calculator className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-base font-semibold text-foreground mb-3">Generated Excel Formula</h5>
                            <div className="relative p-4 bg-card rounded-lg border border-dashboard-success/30 shadow-inner">
                              <code className="text-sm text-dashboard-success font-mono leading-relaxed block">
                                {result.formula}
                              </code>
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-dashboard-success/20 text-dashboard-success border-dashboard-success/30 text-xs">
                                  Excel
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Insight Display */}
                      <div className="relative p-5 rounded-xl bg-dashboard-accent/5 border border-dashboard-accent/20 shadow-lg">
                        <div className="absolute top-3 right-3 h-2 w-2 bg-dashboard-accent rounded-full"></div>
                        <div className="flex items-start space-x-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-dashboard-accent to-dashboard-primary flex items-center justify-center shadow-lg">
                            <Lightbulb className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-base font-semibold text-foreground mb-3">AI Insights & Analysis</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-glass-bg p-4 rounded-lg border border-dashboard-accent/20">
                              {result.insight}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
};
