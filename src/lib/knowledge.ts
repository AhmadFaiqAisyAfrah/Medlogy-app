
// import { Pinecone } from '@pinecone-database/pinecone';

// const pc = new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY || '',
// });

const INDEX_NAME = 'medlogy-knowledge';

export async function storeEmbeddings(data: { id: string; text: string; metadata: any }) {
    console.log("Stubbed storeEmbeddings for build fix");
    // Stubbed
}

export async function searchContext(query: string) {
    console.log("Stubbed searchContext for build fix");
    return [];
}
