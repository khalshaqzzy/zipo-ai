import { generativeModel, genAI } from '../llm';

// Simple text chunking function
export const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = i + chunkSize;
    chunks.push(text.substring(i, end));
    i += chunkSize - overlap;
  }
  return chunks;
};

// Function to generate embeddings for a batch of text chunks
export const generateEmbeddings = async (chunks: string[]): Promise<number[][]> => {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.batchEmbedContents({
      requests: chunks.map(chunk => ({ content: { role: "user", parts: [{ text: chunk }] } }))
    });
    return result.embeddings.map((e: any) => e.values);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings for text chunks.');
  }
};

// In-memory store for embeddings (for simplicity, can be replaced with a vector DB)
const embeddingStore: { [fileId: string]: { chunks: string[], vectors: number[][] } } = {};

export const storeEmbeddings = (fileId: string, chunks: string[], vectors: number[][]) => {
  embeddingStore[fileId] = { chunks, vectors };
  console.log(`[ragService] Stored ${vectors.length} vectors for fileId: ${fileId}`);
};

// Simple cosine similarity function
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dotProduct / (magnitudeA * magnitudeB);
};

// Function to retrieve relevant chunks
export const retrieveRelevantChunks = async (query: string, fileIds: string[], topK: number = 3): Promise<string> => {
  if (fileIds.length === 0) return '';

  try {
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const queryEmbeddingResult = await embeddingModel.embedContent(query);
    const queryVector = queryEmbeddingResult.embedding.values;

    const allSimilarities: { chunk: string, score: number }[] = [];

    for (const fileId of fileIds) {
      const fileData = embeddingStore[fileId];
      if (fileData) {
        fileData.vectors.forEach((vector, index) => {
          const score = cosineSimilarity(queryVector, vector);
          allSimilarities.push({ chunk: fileData.chunks[index], score });
        });
      }
    }

    if (allSimilarities.length === 0) return '';

    // Sort by similarity score and take the top K
    const topChunks = allSimilarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    console.log(`[ragService] Retrieved ${topChunks.length} relevant chunks for query: ${query}`);
    topChunks.forEach((chunk, index) => {
      console.log(`  [Chunk ${index + 1}] Score: ${chunk.score.toFixed(4)}`);
    });

    return topChunks.map(item => item.chunk).join('\n\n---\n\n');

  } catch (error) {
    console.error('Error retrieving relevant chunks:', error);
    // Fallback to returning empty string on error
    return '';
  }
};