const axios = require('axios');
const Employee = require('../models/Employee');

/**
 * @desc    Get AI-powered recommendation for employee(s)
 * @route   POST /api/ai/recommend
 * @access  Protected
 *
 * Request body:
 * {
 *   employeeIds: [id1, id2, ...],   // Array of employee IDs
 *   type: "promotion" | "training" | "ranking" | "feedback"
 * }
 */
const getRecommendation = async (req, res, next) => {
  try {
    const { employeeIds, type } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(400);
      throw new Error('Please provide at least one employee ID');
    }

    if (!type || !['promotion', 'training', 'ranking', 'feedback'].includes(type)) {
      res.status(400);
      throw new Error('Please provide a valid recommendation type: promotion, training, ranking, or feedback');
    }

    // Fetch employee data from database
    const employees = await Employee.find({ _id: { $in: employeeIds } });

    if (employees.length === 0) {
      res.status(404);
      throw new Error('No employees found with the provided IDs');
    }

    // Build employee data string for the AI prompt
    const employeeData = employees
      .map(
        (emp) =>
          `- Name: ${emp.name}, Department: ${emp.department}, Skills: ${emp.skills.join(', ')}, Performance Score: ${emp.performanceScore}/100, Experience: ${emp.experience} years`
      )
      .join('\n');

    // Build the AI prompt based on recommendation type
    const prompts = {
      promotion: `You are an expert HR consultant. Analyze the following employee data and provide detailed promotion recommendations. For each employee, evaluate their readiness for promotion based on their performance score, skills, and experience. Provide specific reasons and suggested new roles or responsibilities.

Employee Data:
${employeeData}

Provide your response in a clear, structured format with:
1. Promotion Readiness Assessment (Ready / Needs Development / Not Ready)
2. Key Strengths
3. Recommended Next Role or Responsibility
4. Action Items before promotion (if any)`,

      training: `You are an expert HR training consultant. Analyze the following employee data and suggest personalized training programs. Consider their current skills, performance gaps, and career growth potential.

Employee Data:
${employeeData}

Provide your response in a clear, structured format with:
1. Skill Gap Analysis
2. Recommended Training Programs (with priority level)
3. Expected Outcomes after training
4. Timeline suggestion`,

      ranking: `You are an expert HR performance analyst. Rank the following employees based on their overall performance, skills diversity, and experience. Provide a justified ranking with detailed reasoning.

Employee Data:
${employeeData}

Provide your response in a clear, structured format with:
1. Overall Ranking (1st, 2nd, 3rd, etc.)
2. Score Breakdown (Performance, Skills, Experience)
3. Key Differentiators
4. Improvement suggestions for each employee`,

      feedback: `You are an expert HR performance reviewer. Generate comprehensive performance feedback for the following employee(s). Be constructive, specific, and actionable.

Employee Data:
${employeeData}

Provide your response in a clear, structured format with:
1. Overall Performance Summary
2. Strengths & Achievements
3. Areas for Improvement
4. Goals for Next Quarter
5. Manager Recommendations`,
    };

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [
          {
            role: 'system',
            content: 'You are an AI-powered HR analytics assistant. Provide detailed, professional, and actionable recommendations.',
          },
          {
            role: 'user',
            content: prompts[type],
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Employee Performance Analytics',
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content;

    res.json({
      type,
      employees: employees.map((e) => ({ id: e._id, name: e.name, department: e.department })),
      recommendation: aiMessage,
    });
  } catch (error) {
    // Handle OpenRouter API errors specifically
    if (error.response && error.response.data) {
      res.status(error.response.status || 500);
      return next(new Error(`AI API Error: ${error.response.data.error?.message || 'Failed to get AI recommendation'}`));
    }
    next(error);
  }
};

module.exports = { getRecommendation };
