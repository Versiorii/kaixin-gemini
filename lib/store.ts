import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Message, Conversation } from './types';

// ============================================================================
// 类型定义
// ============================================================================

export type EditingMessage = {
  id: string;
  originalContent: string;
  currentContent: string;
  startedAt: number;
};

export type SearchFilter = {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  model?: string;
  hasCode?: boolean;
  tag?: string;
  isUserMessage?: boolean;
};

export type ConversationStore = {
  // 状态
  conversations: Conversation[];
  currentId: string | undefined;
  loading: boolean;
  error: string | null;

  // 动作
  setConversations: (conversations: Conversation[]) => void;
  setCurrentId: (id: string | undefined) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  reset: () => void;
};

export type MessageStore = {
  // 状态
  messages: Message[];
  editingMessage: EditingMessage | null;
  selectedMessageIds: Set<string>;
  messageReferences: Map<string, string[]>; // msgId -> [referencedMsgIds]

  // 动作
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (index: number, updates: Partial<Message>) => void;
  deleteMessage: (index: number) => void;
  setEditingMessage: (msg: EditingMessage | null) => void;
  toggleMessageSelection: (index: number) => void;
  clearSelection: () => void;
  addMessageReference: (fromId: string, toId: string) => void;
  clearMessages: () => void;
};

export type UIStore = {
  // 状态
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  showCommandPalette: boolean;
  showSearchPanel: boolean;
  showAnalyticsPanel: boolean;
  showExportModal: boolean;
  showWorkflowBuilder: boolean;
  showFileManager: boolean;
  toasts: Array<{ id: string; message: string; type: 'info' | 'success' | 'error'; }>;

  // 动作
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSearchPanel: () => void;
  closeSearchPanel: () => void;
  openAnalyticsPanel: () => void;
  closeAnalyticsPanel: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  openWorkflowBuilder: () => void;
  closeWorkflowBuilder: () => void;
  openFileManager: () => void;
  closeFileManager: () => void;
  addToast: (message: string, type: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
};

export type SearchStore = {
  // 状态
  filter: SearchFilter;
  results: Message[];
  isSearching: boolean;

  // 动作
  setFilter: (filter: SearchFilter) => void;
  setResults: (results: Message[]) => void;
  setIsSearching: (searching: boolean) => void;
  reset: () => void;
};

export type ChatStore = {
  // 状态
  model: string;
  isStreaming: boolean;
  streamingContent: string;
  inputHistory: string[];
  inputHistoryIndex: number;

  // 动作
  setModel: (model: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;
  addInputHistory: (input: string) => void;
  setInputHistoryIndex: (index: number) => void;
};

// ============================================================================
// Store 实现
// ============================================================================

export const useConversationStore = create<ConversationStore>()(
  devtools(
    persist(
      (set) => ({
        conversations: [],
        currentId: undefined,
        loading: false,
        error: null,

        setConversations: (conversations) => set({ conversations }),
        setCurrentId: (id) => set({ currentId: id }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        addConversation: (conversation) =>
          set((state) => ({
            conversations: [conversation, ...state.conversations],
          })),

        updateConversation: (id, updates) =>
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          })),

        deleteConversation: (id) =>
          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            currentId: state.currentId === id ? undefined : state.currentId,
          })),

        reset: () =>
          set({
            conversations: [],
            currentId: undefined,
            error: null,
          }),
      }),
      {
        name: 'conversation-store',
        partialize: (state) => ({
          conversations: state.conversations,
          currentId: state.currentId,
        }),
      }
    )
  )
);

export const useMessageStore = create<MessageStore>()(
  devtools(
    (set) => ({
      messages: [],
      editingMessage: null,
      selectedMessageIds: new Set(),
      messageReferences: new Map(),

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessage: (index, updates) =>
        set((state) => {
          const newMessages = [...state.messages];
          newMessages[index] = { ...newMessages[index], ...updates };
          return { messages: newMessages };
        }),

      deleteMessage: (index) =>
        set((state) => ({
          messages: state.messages.filter((_, i) => i !== index),
        })),

      setEditingMessage: (msg) => set({ editingMessage: msg }),

      toggleMessageSelection: (index) =>
        set((state) => {
          const newSelected = new Set(state.selectedMessageIds);
          const id = String(index);
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
          return { selectedMessageIds: newSelected };
        }),

      clearSelection: () => set({ selectedMessageIds: new Set() }),

      addMessageReference: (fromId, toId) =>
        set((state) => {
          const newReferences = new Map(state.messageReferences);
          const existing = newReferences.get(fromId) || [];
          if (!existing.includes(toId)) {
            newReferences.set(fromId, [...existing, toId]);
          }
          return { messageReferences: newReferences };
        }),

      clearMessages: () =>
        set({
          messages: [],
          editingMessage: null,
          selectedMessageIds: new Set(),
          messageReferences: new Map(),
        }),
    })
  )
);

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        sidebarOpen: true,
        showCommandPalette: false,
        showSearchPanel: false,
        showAnalyticsPanel: false,
        showExportModal: false,
        showWorkflowBuilder: false,
        showFileManager: false,
        toasts: [],

        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        openCommandPalette: () => set({ showCommandPalette: true }),
        closeCommandPalette: () => set({ showCommandPalette: false }),
        openSearchPanel: () => set({ showSearchPanel: true }),
        closeSearchPanel: () => set({ showSearchPanel: false }),
        openAnalyticsPanel: () => set({ showAnalyticsPanel: true }),
        closeAnalyticsPanel: () => set({ showAnalyticsPanel: false }),
        openExportModal: () => set({ showExportModal: true }),
        closeExportModal: () => set({ showExportModal: false }),
        openWorkflowBuilder: () => set({ showWorkflowBuilder: true }),
        closeWorkflowBuilder: () => set({ showWorkflowBuilder: false }),
        openFileManager: () => set({ showFileManager: true }),
        closeFileManager: () => set({ showFileManager: false }),

        addToast: (message, type) =>
          set((state) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const newToasts = [...state.toasts, { id, message, type }];
            setTimeout(() => {
              useUIStore.setState((s) => ({
                toasts: s.toasts.filter((t) => t.id !== id),
              }));
            }, 3000);
            return { toasts: newToasts };
          }),

        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          })),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);

export const useSearchStore = create<SearchStore>()(
  devtools(
    (set) => ({
      filter: { query: '' },
      results: [],
      isSearching: false,

      setFilter: (filter) => set({ filter }),
      setResults: (results) => set({ results }),
      setIsSearching: (searching) => set({ isSearching: searching }),
      reset: () =>
        set({
          filter: { query: '' },
          results: [],
          isSearching: false,
        }),
    })
  )
);

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set) => ({
        model: 'gemini-3.5-flash',
        isStreaming: false,
        streamingContent: '',
        inputHistory: [],
        inputHistoryIndex: -1,

        setModel: (model) => set({ model }),
        setIsStreaming: (streaming) => set({ isStreaming: streaming }),

        appendStreamingContent: (content) =>
          set((state) => ({
            streamingContent: state.streamingContent + content,
          })),

        clearStreamingContent: () => set({ streamingContent: '' }),

        addInputHistory: (input) =>
          set((state) => ({
            inputHistory: [...state.inputHistory, input],
            inputHistoryIndex: -1,
          })),

        setInputHistoryIndex: (index) => set({ inputHistoryIndex: index }),
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          model: state.model,
          inputHistory: state.inputHistory.slice(-50), // 只保存最近 50 条
        }),
      }
    )
  )
);
