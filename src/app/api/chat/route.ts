/* 64줄까지
import { NextResponse } from 'next/server';
import { OpenAI } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs/promises';
import path from 'path';

// AI 모델(Chain)을 담아둘 변수. 한번 만들면 재사용해서 속도를 높입니다.
let chain: RetrievalQAChain | null = null;

// 약관 파일을 읽고 AI를 학습시키는 핵심 함수
async function initializeRag() {
  if (chain) return;
  try {
    const filePath = path.join(process.cwd(), 'data', 'terms.txt');
    const text = await fs.readFile(filePath, 'utf8');

    const textSplitter = new CharacterTextSplitter({
      separator: "\n",
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([text]);

    // .env.local 파일에서 키를 읽어오도록 원래 코드로 복원
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
    
    const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
    chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    console.log('✅ AI 모델 준비 완료!');

  } catch (error) {
    console.error('❌ AI 모델 준비 중 에러 발생:', error);
  }
}

// '/api/chat'으로 POST 요청이 오면 이 함수가 실행됩니다.
export async function POST(req: Request) {
  await initializeRag();

  if (!chain) {
    return NextResponse.json({ error: 'AI 모델이 아직 준비되지 않았습니다.' }, { status: 500 });
  }

  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content;

    if (!lastUserMessage) {
      return NextResponse.json({ error: '사용자 메시지를 찾을 수 없습니다.' }, { status: 400 });
    }

    const response = await chain.call({ query: lastUserMessage });
    return new NextResponse(response.text, { status: 200 });

  } catch (error) {
    console.error('답변 생성 중 에러 발생:', error);
    return NextResponse.json({ error: '답변을 생성하는 데 실패했습니다.' }, { status: 500 });
  }
}
  */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { PromptTemplate } from "@langchain/core/prompts";
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HfInference } from "@huggingface/inference";

let retriever: any = null;
let prompt: PromptTemplate | null = null;
let hf: HfInference | null = null;

async function initializeRag() {
  if (retriever) return;
  try {
    const filePath = path.join(process.cwd(), 'data', 'terms.txt');
    const text = await fs.readFile(filePath, 'utf8');

    const textSplitter = new CharacterTextSplitter({
      separator: "\n", chunkSize: 1000, chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([text]);

    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
        model: "jhgan/ko-sroberta-multitask",
    });
    
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    retriever = vectorStore.asRetriever();
    
    // --- 변경된 부분: 프롬프트 템플릿을 한글로 수정 ---
    const template = `당신은 친절한 안내원입니다. 사용자의 질문에 대해 주어진 문맥(Context)만을 사용하여 한국어로 답변해주세요. 문맥에 답변이 없는 경우, "죄송하지만 해당 정보는 찾을 수 없습니다."라고 답변해주세요.

Context: {context}
Question: {question}`;
    prompt = PromptTemplate.fromTemplate(template);

    hf = new HfInference(process.env.HUGGINGFACEHUB_API_TOKEN);
    
    console.log('✅ RAG 준비 완료 (Hugging Face 직접 호출 방식)');

  } catch (error) {
    console.error('❌ AI 모델 준비 중 에러 발생:', error);
  }
}

export async function POST(req: Request) {
  await initializeRag();

  if (!retriever || !prompt || !hf) {
    return NextResponse.json({ error: 'AI 모델이 아직 준비되지 않았습니다.' }, { status: 500 });
  }

  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content;

    if (!lastUserMessage) {
      return NextResponse.json({ error: '사용자 메시지를 찾을 수 없습니다.' }, { status: 400 });
    }
    
    const retrievedDocs = await retriever.getRelevantDocuments(lastUserMessage);
    const context = retrievedDocs.map((doc) => doc.pageContent).join("\n\n");
    const formattedPrompt = await prompt.format({
      context: context,
      question: lastUserMessage,
    });

    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: formattedPrompt }],
    });

    const reply = response.choices[0].message.content || "죄송합니다, 답변을 생성할 수 없습니다.";

    return new NextResponse(reply, { status: 200 });

  } catch (error) {
    console.error('답변 생성 중 에러 발생:', error);
    return NextResponse.json({ error: '답변을 생성하는 데 실패했습니다.', status: 500 });
  }
}