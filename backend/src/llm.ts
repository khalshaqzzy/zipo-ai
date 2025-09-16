import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, Content } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IMessage } from './models/Message';

dotenv.config();

const apiKey = process.env.LLM_API_KEY;
if (!apiKey) {
  throw new Error('LLM_API_KEY is not set in the environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey);

const canvasTools: FunctionDeclaration[] = [
  {
    "name": "retrieve_document_context",
    "description": "Retrieves relevant context from the uploaded documents based on a specific query. This should be called when the user's question requires information from the documents.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "query": {
          "type": SchemaType.STRING,
          "description": "The specific question or topic to search for within the documents."
        }
      },
      "required": ["query"]
    }
  },
  {
    "name": "speak",
    "description": "Provides the verbal part of the explanation. Should be called before visual elements to introduce them.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "text": {
          "type": SchemaType.STRING,
          "description": "The text to be spoken by the AI tutor."
        }
      },
      "required": ["text"]
    }
  },
  {
    "name": "createText",
    "description": "Renders text on the canvas, like labels or titles.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "x": { "type": SchemaType.NUMBER, "description": "The x-coordinate." },
        "y": { "type": SchemaType.NUMBER, "description": "The y-coordinate." },
        "text": { "type": SchemaType.STRING, "description": "The text content to display." },
        "fontSize": { "type": SchemaType.NUMBER, "description": "The font size of the text." },
        "color": { "type": SchemaType.STRING, "description": "The color of the text (e.g., '#RRGGBB')." },
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["x", "y", "text", "delay"]
    }
  },
  {
    "name": "drawRectangle",
    "description": "Draws a rectangle on the canvas.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "x": { "type": SchemaType.NUMBER },
        "y": { "type": SchemaType.NUMBER },
        "width": { "type": SchemaType.NUMBER },
        "height": { "type": SchemaType.NUMBER },
        "color": { "type": SchemaType.STRING },
        "label": { "type": SchemaType.STRING, "description": "A label to display inside the rectangle." },
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["x", "y", "width", "height", "color", "delay"]
    }
  },
  {
    "name": "drawCircle",
    "description": "Draws a circle on the canvas.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "x": { "type": SchemaType.NUMBER },
        "y": { "type": SchemaType.NUMBER },
        "radius": { "type": SchemaType.NUMBER },
        "color": { "type": SchemaType.STRING },
        "label": { "type": SchemaType.STRING, "description": "A label for the circle." },
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["x", "y", "radius", "color", "delay"]
    }
  },
  {
    "name": "drawArrow",
    "description": "Draws an arrow to connect elements.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "points": {
          "type": SchemaType.ARRAY,
          "description": "An array of coordinates [x1, y1, x2, y2, ...].",
          "items": { "type": SchemaType.NUMBER }
        },
        "color": { "type": SchemaType.STRING },
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["points", "color", "delay"]
    }
  },
  {
    "name": "createTable",
    "description": "Draws the structure of a table.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "id": { "type": SchemaType.STRING, "description": "A unique identifier for the table." },
        "x": { "type": SchemaType.NUMBER },
        "y": { "type": SchemaType.NUMBER },
        "rows": { "type": SchemaType.NUMBER },
        "cols": { "type": SchemaType.NUMBER },
        "colWidths": { "type": SchemaType.ARRAY, "items": { "type": SchemaType.NUMBER } },
        "rowHeight": { "type": SchemaType.NUMBER },
        "headers": { "type": SchemaType.ARRAY, "items": { "type": SchemaType.STRING } },
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["id", "x", "y", "rows", "cols", "colWidths", "rowHeight", "headers", "delay"]
    }
  },
  {
    "name": "fillTable",
    "description": "Fills a specific cell in a pre-drawn table.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "tableId": { "type": SchemaType.STRING, "description": "The ID of the target table." },
        "row": { "type": SchemaType.NUMBER, "description": "The 0-indexed row number." },
        "col": { "type": SchemaType.NUMBER, "description": "The 0-indexed column number." },
        "text": { "type": SchemaType.STRING, "description": "The content to fill in the cell." },
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["tableId", "row", "col", "text", "delay"]
    }
  },
  {
    "name": "clearCanvas",
    "description": "Clears all elements from the canvas.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {
        "delay": { "type": SchemaType.NUMBER, "description": "Time in milliseconds to wait after this command." }
      },
      "required": ["delay"]
    }
  },
  {
    "name": "session_end",
    "description": "Signals that the presentation is complete. Must be the last tool called.",
    "parameters": {
      "type": SchemaType.OBJECT,
      "properties": {},
      "required": []
    }
  }
];

export const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export const generativeModelTools = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  tools: [{functionDeclarations: canvasTools}],
});


export function buildHistoryForChat(messages: IMessage[]): Content[] {
  const history: Content[] = [];

  for (const message of messages) {
    const role = message.sender === 'user' ? 'user' : 'model';
    let parts: any[] = [];

    if (role === 'model') {
      try {
        const toolCalls = JSON.parse(message.text);
        parts = toolCalls.map((call: any) => {
          const { audioContent, ...restPayload } = call.payload;
          return {
            functionCall: {
              name: call.command,
              args: restPayload, // Send payload without audioContent
            },
          };
        });
      } catch (e) {
        parts.push({ text: message.text });
      }
    } else {
      parts.push({ text: message.text });
    }

    history.push({ role, parts });
  }
  return history;
}

export function createInitialPrompt(documentSummaries?: string): Content[] {
  let contextText = `You are Zipo, an expert tutor AI. Your personality is enthusiastic, patient, and incredibly supportive. You are passionate about making complex topics easy to understand. Your goal is to be a helpful and engaging learning companion.

  **Tool-Calling Principles**

  When you have gathered all the information you need (including from tools), you MUST generate the COMPLETE and FULL sequence of tool calls required to fulfill the user's request in a single response. Do not wait for tool results. Plan the entire visual and verbal presentation.
  1.  **Introduce First, Then Draw:** Always start with a \`speak\` tool call to introduce what you're about to explain visually.
  2.  **Build Step-by-Step:** Don't draw everything at once. Add one or two related visual elements, then use \`speak\` to explain them.
  3.  **Use Delays for Pacing:** Every visual tool call requires a \`delay\` property in milliseconds.
  4.  **Conclude the Session:** Always end your sequence of tool calls with \`session_end\`.
  
  **Stateful tool-use workflow Example
  This is how you should reason and use tools.

  **Users prompt: Explain the concept of SQL and NoSQL based on my document**

  Your thought process (Turn 1): "The user is asking about a specific document. I need to get information from it first. i will call the \`retrieve_document_context\` tool."
  Your Action (Turn 1): You will return a \`functionCall\` to \`retrieve_document_context\` with the query "SQL and NoSQL" (adjust the query for a better performance and results).

  **Backends response**: The backend will execute the tool and send the result back to you.

  Your thought process (Turn 2): "Excellent, I now have the necessary context about SQL and NoSQL. I can now generate the full visual and verbal explanation."

  Your Action (Turn 2): You will return the complete and final sequence of \`speak\`, \`createText\`, \`drawArrow\`, etc., calls to explain the concept, ending with \`sessionEnd\`
 
  **Example of a Complete, Explanation Response:**
  *Your Thought Process:* "Okay, I need to generate the *entire* sequence of calls in one go. I'll start by introducing the topic. Then, I'll draw the table. After that, I'll explain the 'Structure' difference and fill that part of the table. Then, I'll explain 'Scalability' and fill that part. Finally, I'll end the session."

  *Resulting Full Sequence of Tool Calls (as a single response):*
  1.  \`speak({ text: "Let's compare SQL and NoSQL databases. I'll create a table to show the key differences." })\`
  2.  \`createTable({ id: "db-comp", ..., headers: ["Feature", "SQL", "NoSQL"], delay: 1000 })\`
  3.  \`speak({ text: "First, let's look at their data structure." })\`
  4.  \`fillTable({ tableId: "db-comp", row: 1, col: 0, text: "Structure", delay: 500 })\`
  5.  \`fillTable({ tableId: "db-comp", row: 1, col: 1, text: "Tables with rows", delay: 500 })\`
  6.  \`fillTable({ tableId: "db-comp", row: 1, col: 2, text: "JSON, key-value", delay: 1500 })\`
  7.  \`speak({ text: "Next, how they handle scalability." })\`
  8.  \`fillTable({ tableId: "db-comp", row: 2, col: 0, text: "Scalability", delay: 500 })\`
  9.  \`fillTable({ tableId: "db-comp", row: 2, col: 1, text: "Vertical", delay: 500 })\`
  10. \`fillTable({ tableId: "db-comp", row: 2, col: 2, text: "Horizontal", delay: 1500 })\`
  11. \`session_end({})\`  

  **Note**: Adjust your final response to be more detailed, explanatory.
  
  
  
  
  `;

  if (documentSummaries) {
    contextText += `

**Available Documents:**
    The following documents are available for this session. If the user's question seems to relate to one of them, you MUST use the 'retrieve_document_context' tool to get more information before answering.

    ${documentSummaries}`;
  }

  return [
      { role: 'user', parts: [{ text: contextText }] },
      { role: 'model', parts: [{ text: "Okay, I understand my role. I am Zipo, an expert AI tutor. I will await the user's prompt." }] }
  ];
}


export function createModulePlanPrompt(userInput: string, moduleLength: 'Short' | 'Medium' | 'Long', fileContent?: string): string {
  const stepCount = { 'Short': 1, 'Medium': 3, 'Long': 5 }[moduleLength];

  const fileContext = fileContent
    ? `
    **Primary Knowledge Source:**
    The user has provided the following document(s) as the main source of truth. Base your entire explanation on this content.
    
    **Document(s) Content:**
    """
    ${fileContent}
    """
    `
    : '';

  return `
    You are an expert curriculum designer AI. Your task is to create a structured lesson plan based on a user's request and any provided documents.
    The lesson will be broken down into ${stepCount} part(s).

    **User's Request:** "${userInput}"
    ${fileContext}

    **Your Task:**
    Based on the user's request and the provided context, break down the topic into ${stepCount} distinct, logically-sequenced sub-topics. Each sub-topic should represent one part of the lesson.
    
    **Output Format:**
    You MUST respond with a valid JSON object. The object should have a single key, "plan", which is an array of strings. Each string in the array is a sub-topic.

    **Example for a 3-part lesson on Photosynthesis:**
    {
      "plan": [
        "Introduction to Photosynthesis: What it is and its essential ingredients (sunlight, water, CO2).",
        "The Two Stages: A detailed look at the Light-Dependent Reactions and the Calvin Cycle.",
        "Importance and Summary: Why photosynthesis is crucial for life on Earth and a recap of the process."
      ]
    }

    Now, generate the plan for the user's request.
  `;
}

interface PreviousModuleContext {
  canvasState: any[];
  transcript: string[];
}

export function createModulePrompt(userInput: string, fileContent: string | undefined, previousContext: PreviousModuleContext | undefined, modulePlan: string[], currentStepTopic: string): string {
  const fileContext = fileContent
    ? `
    **Primary Knowledge Source:**
    The user has provided the following document(s) as the main source of truth. Base your entire explanation on this content. Do not use outside knowledge unless absolutely necessary to clarify a concept from the document. If the user's question cannot be answered from the document(s), say so.
    
    **Document(s) Content:**
    """
    ${fileContent}
    """
    `
    : '';

  const continuationContext = previousContext
    ? `
    **Continuation Context:**
    This is a continuation of a multi-part module. You have already generated the following content. Your task is to continue the explanation from where you left off, building upon the existing canvas and transcript.

    **Existing Canvas State (simplified):**
    ${JSON.stringify(previousContext.canvasState.map(o => o.command))}

    **Existing Transcript:**
    ${previousContext.transcript.join('\n')}
    `
    : '';

  const planContext = `
    **Overall Module Plan:**
    ${modulePlan.map((step, index) => `- Step ${index + 1}: ${step}`).join('\n')}

    **Current Task:**
    Your current task is to generate the content for the following sub-topic:
    **"${currentStepTopic}"**

    Please generate a set of commands to explain this specific part of the lesson. Ensure your explanation flows logically from the previous steps (if any) and fits into the overall plan.
  `;

  const instruction = `
    You are Zipo, an expert tutor AI. Your personality is enthusiastic, patient, and incredibly supportive.
    You are generating a part of a larger learning module.
    Your mission is to transform the explanation for the current task into a dynamic, visual, and verbal presentation.
    You must respond with a JSON array of command objects. Each object represents a single action in the presentation.
    Do NOT add a 'session_end' command, as this module may have multiple parts.
  `;

  return `
    ${instruction}
    ${fileContext}
    ${continuationContext}
    ${planContext}

    **Core Principles:**
    1.  **Verbal First:** Start with a "speak" command to introduce the topic.
    2.  **Build Visually:** Gradually build the diagram on the canvas. Add an element, then explain it with a "speak" command.
    3.  **Pacing is Key:** Add a "delay" property to every command object **except for "speak"**. This is the time in milliseconds to wait *after* the command is executed. Use shorter delays (e.g., 500-1500ms) for drawing commands.
    4.  **Be Clear:** Keep explanations and visual labels concise.
    5.  **JSON Only:** Your entire output must be a single, valid JSON array.


   **Available Commands:**

        1.  **\`speak\`**: Provides the verbal part of the explanation.
        - \`payload\`: { "text": "Your explanation for the current step." }

    2.  **\`createText\`**: Renders text on the canvas.
        - \`payload\`: { "x": <number>, "y": <number>, "text": "Label or title", "fontSize": <number>, "color": "<string>" }
        - \`delay\`: <milliseconds>

    3.  **\`drawRectangle\`**: Draws a rectangle.
        - \`payload\`: { "x": <number>, "y": <number>, "width": <number>, "height": <number>, "color": "<string>", "label": "<string>" }
        - \`delay\`: <milliseconds>

    4.  **\`drawCircle\`**: Draws a circle.
        - \`payload\`: { "x": <number>, "y": <number>, "radius": <number>, "color": "<string>", "label": "<string>" }
        - \`delay\`: <milliseconds>

    5.  **\`drawArrow\`**: Draws an arrow to connect elements.
        - \`payload\`: { "points": [<x1>, <y1>, <x2>, <y2>], "color": "<string>" }
        - \`delay\`: <milliseconds>

    6.  **\`createTable\`**: Draws the structure of a table.
        - \`payload\`: { "id": "<string>", "x": <number>, "y": <number>, "rows": <number>, "cols": <number>, "colWidths": [<number>], "rowHeight": <number>, "headers": ["<string>"] }
        - \`delay\`: <milliseconds>

    7.  **\`fillTable\`**: Fills a specific cell in a pre-drawn table. NOTE: FOR FILLING A CELL WITH MEDIUM TO LONG TEXTS CONSIDER ADDING \n TO PREVENT CELL OVERFLOW. \n  DOES NOT NEED TO BE AT THE END OF A SENTENCE. INSERT \n EVERY 3-4 WORDS
        - \`payload\`: { "tableId": "<string>", "row": <number>, "col": <number>, "text": "Content" }
        - \`delay\`: <milliseconds>

    8.  **\`clearCanvas\`**: Clears all elements from the canvas.
        - \`payload\`: {}
        - \`delay\`: <milliseconds>

    **Example Workflow for "Compare SQL and NoSQL databases":**
    [
      {
        "command": "speak",
        "payload": { "text": "Let's compare SQL and NoSQL databases. I'll create a table to show the key differences." }
      },
      {
        "command": "createTable",
        "payload": { "id": "db-comparison", "x": 50, "y": 50, "rows": 3, "cols": 3, "colWidths": [200, 300, 300], "rowHeight": 40, "headers": ["Feature", "SQL", "NoSQL"] },
        "delay": 1000
      },
      {
        "command": "speak",
        "payload": { "text": "First, let's look at their data structure." }
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 1, "col": 0, "text": "Structure" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 1, "col": 1, "text": "Tables with rows" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 1, "col": 2, "text": "JSON, key-value" },
        "delay": 1500
      },
      {
        "command": "speak",
        "payload": { "text": "Next, how they handle scalability." }
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 2, "col": 0, "text": "Scalability" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 2, "col": 1, "text": "Vertical" },
        "delay": 500
      },
      {
        "command": "fillTable",
        "payload": { "tableId": "db-comparison", "row": 2, "col": 2, "text": "Horizontal" },
        "delay": 1500
      }
    ]
  `;
}



/*
export function createQuizPrompt(content: string, instructions: string, questionCount: number): string {
  return `
You are an expert quiz generator. Based on the provided document content and instructions, create a comprehensive quiz.

**Document Content:**
${content}

**Instructions:**
${instructions}

**Requirements:**
- Generate exactly ${questionCount} questions.
- Mix question types: multiple-choice, true-false, and checkboxes (for multiple correct answers).
- Ensure questions test different aspects: comprehension, analysis, application.
- Provide clear, unambiguous questions.
- For multiple-choice questions, provide 4 options with only one correct answer.
- For true-false questions, ensure the statement is clearly true or false.
- For checkboxes questions, provide 4-5 options where 1 or more can be correct.
- Include brief explanations for correct answers for all question types.

**Output Format:**
Respond with a valid JSON object in this exact format:

{
  "title": "Quiz Title Based on Content",
  "questions": [
    {
      "question": "Which of the following are primary colors?",
      "type": "checkboxes",
      "options": ["Red", "Green", "Blue", "Yellow"],
      "correctAnswer": [0, 2, 3],
      "explanation": "Red, Blue, and Yellow are the primary colors."
    },
    {
      "question": "The sky is blue.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "The sky appears blue due to Rayleigh scattering."
    },
    {
      "question": "What is the capital of France?",
      "type": "multiple-choice",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2,
      "explanation": "Paris is the capital of France."
    }
  ]
}

**Important:**
- `correctAnswer` for multiple-choice and true-false should be the index (0, 1, 2, 3).
- `correctAnswer` for checkboxes must be an array of correct indices (e.g., [0, 2]).
- Ensure all questions are directly related to the provided content.
- Make questions challenging but fair.
- Vary the difficulty levels across questions.

Generate the quiz now:
`;
}
*/