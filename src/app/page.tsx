// app/page.tsx

import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    // 배경색을 아주 연한 회색으로 변경
    <main className="flex h-screen w-screen bg-slate-50 justify-center items-center p-4">
      {/* 챗봇 컨테이너에 그림자 효과 추가 */}
      <div className="flex h-full w-full max-w-3xl flex-col bg-white rounded-2xl shadow-xl">
        {/* 헤더 */}
        <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-bold">
            M
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-black">모구챗</h1>
            <p className="text-sm text-green-600 flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </p>
          </div>
        </header>

        {/* 채팅 인터페이스 */}
        <ChatInterface />
      </div>
    </main>
  );
}