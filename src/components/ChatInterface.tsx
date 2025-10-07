// src/components/ChatInterface.tsx

'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

// 관련 콘텐츠 데이터의 타입을 정의합니다.
type RelatedContent = {
  title: string;
  description: string;
  link: string;
};

// 각 질문에 대한 관련 콘텐츠 데이터를 미리 정의합니다.
const relatedContentData: Record<string, RelatedContent> = {
  '모구 수수료 제한': {
    title: '수수료 설정 가이드',
    description: '총액의 0~20% 사이에서 자유롭게 설정하는 방법을 알아보세요.',
    link: '#',
  },
  '모구 마감 기한': {
    title: '마감 기한 활용법',
    description: '최소 1일부터 최대 14일까지, 효과적인 딜 관리 팁을 확인하세요.',
    link: '#',
  },
  '모구 환불 금지 품목': {
    title: '환불 불가 품목 안내',
    description: '주문 제작, 신선 식품 등 환불이 어려운 품목 리스트입니다.',
    link: '#',
  },
};

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    api: '/api/chat',
  });

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // 👇 1. 사용자가 직접 입력한 질문을 저장할 새로운 상태를 만듭니다.
  const [userQuestion, setUserQuestion] = useState<string | null>(null);

  const handleSuggestionClick = (text: string) => {
    if (selectedTopic === text) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(text);
      // append({ content: text, role: 'user' }); // 말풍선 생성 기능 비활성화
    }
  };

  // 👇 2. 기존 handleSubmit 함수를 감싸는 새로운 함수를 만듭니다.
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // 사용자가 입력한 내용을 userQuestion 상태에 저장합니다.
    setUserQuestion(input); 
    // 기존의 handleSubmit 함수를 호출하여 AI에게 메시지를 보냅니다.
    handleSubmit(e);
  };


  const initialMessage = {
    id: 'initial',
    role: 'assistant' as const,
    content: '궁금한 내용을 입력해주시면, 답변을 빠르게 챗봇이 도와드릴게요.',
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* 메시지들이 보이는 창 */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-full mx-auto">

          {/* --- 1. 정적 UI: 환영 메시지 --- */}
          <div key={initialMessage.id} className="flex">
            <div className={`flex w-full items-start justify-start mb-6`}>
              <div className="w-8 h-8 rounded-full bg-purple-500 mr-4 self-end flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">M</div>
              <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-slate-100 text-black rounded-bl-none">
                {initialMessage.content}
              </div>
            </div>
          </div>

          {/* --- 2. 정적 UI: 많이 찾는 질문 --- */}
          <div className="bg-slate-50 p-6 rounded-lg mt-4 border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-black">많이 찾는 질문</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.keys(relatedContentData).map((question) => (
                <button 
                  key={question} 
                  onClick={() => handleSuggestionClick(question)} 
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedTopic === question 
                      ? 'bg-[#DD93EA] text-white border-[#DD93EA]' 
                      : 'bg-white text-black border-gray-200 hover:bg-slate-100 hover:border-purple-300'
                  }`}
                >
                  <span className="font-semibold">{question}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 👇 3. 사용자가 직접 입력한 질문을 표시할 영역을 추가합니다. */}
          {userQuestion && (
            <div className="flex justify-end mt-6">
               <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-purple-600 text-white rounded-br-none">
                  {userQuestion}
               </div>
            </div>
          )}

          {/* --- 4. 동적 UI: 실제 AI 채팅 기록 --- */}
          {messages.map((m) => (
            <div key={m.id} className="flex">
              <div className={`flex w-full items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                {/* 사용자 메시지는 위 userQuestion 영역에서 이미 표시했으므로 여기서는 AI 답변만 표시합니다. */}
                {m.role === 'assistant' && (
                  <>
                    <div className="w-8 h-8 rounded-full bg-purple-500 mr-4 self-end flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">M</div>
                    <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-slate-100 text-black rounded-bl-none">
                      {m.content}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 관련 콘텐츠 표시 영역 */}
      {selectedTopic && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-md text-black">관련 콘텐츠</h4>
            <button onClick={() => setSelectedTopic(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div 
            onClick={(e) => e.preventDefault()}
            className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-gray-200 cursor-pointer"
          >
            <h5 className="font-semibold text-purple-700">{relatedContentData[selectedTopic].title}</h5>
            <p className="text-sm text-gray-600">{relatedContentData[selectedTopic].description}</p>
          </div>
        </div>
      )}

      {/* 메시지 입력 창 */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* 👇 4. form의 onSubmit을 새로 만든 handleFormSubmit 함수로 교체합니다. */}
        <form onSubmit={handleFormSubmit} className="flex items-center bg-slate-100 rounded-full p-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="궁금하신 내용을 입력해주세요."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-black"
          />
          <button type="submit" className="w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors disabled:bg-purple-300" disabled={!input}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}