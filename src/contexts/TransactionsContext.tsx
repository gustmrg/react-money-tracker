import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { createContext } from "use-context-selector";

interface Transaction {
  id: number;
  description: string;
  type: "income" | "outcome";
  category: string;
  amount: number;
  createdAt: string;
}

interface CreateTransactionInput {
  description: string;
  amount: number;
  category: string;
  type: "income" | "outcome";
}

interface TransactionContextType {
  transactions: Transaction[];
  fetchTransactions: (query?: string) => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<void>;
}

interface TransactionsProviderProps {
  children: React.ReactNode;
}

const localTransactions: Transaction[] = [
  {
    id: 1,
    description: "Desenvolvimento de site",
    type: "income",
    category: "Venda",
    amount: 14000,
    createdAt: "2024-09-15T14:39:25.661Z",
  },
  {
    id: 2,
    description: "Hamburguer",
    type: "outcome",
    category: "Alimentação",
    amount: 59,
    createdAt: "2024-09-15T14:39:25.661Z",
  },
  {
    id: 3,
    description: "Computador",
    type: "outcome",
    category: "Eletrônicos",
    amount: 5000,
    createdAt: "2024-09-15T14:39:25.661Z",
  },
  {
    amount: 10000,
    category: "Venda",
    description: "Desenvolvimento de app",
    type: "income",
    createdAt: "2024-09-15T19:27:14.455Z",
    id: 4,
  },
  {
    amount: 7500,
    category: "Eletrônicos",
    description: "iPhone",
    type: "outcome",
    createdAt: "2024-09-15T19:40:45.748Z",
    id: 5,
  },
];

export const TransactionsContext = createContext({} as TransactionContextType);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const useMockAPI = import.meta.env.VITE_USE_MOCK_API === "true";
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function fetchTransactions(query?: string) {
    if (useMockAPI) {
      const filteredTransactions = localTransactions.filter((transaction) =>
        query ? transaction.description.includes(query) : true,
      );
      setTransactions(filteredTransactions);
    } else {
      const response = await api.get("/transactions", {
        params: {
          _sort: "createdAt",
          _order: "desc",
          q: query,
        },
      });

      setTransactions(response.data);
    }
  }

  async function createTransaction(data: CreateTransactionInput) {
    const { amount, category, description, type } = data;
    if (useMockAPI) {
      const newTransaction = {
        id: localTransactions.length + 1,
        amount,
        category,
        description,
        type,
        createdAt: new Date().toISOString(),
      };
      setTransactions((state) => [newTransaction, ...state]);
    } else {
      const response = await api.post("/transactions", {
        amount,
        category,
        description,
        type,
        createdAt: new Date(),
      });

      setTransactions((state) => [response.data, ...state]);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionsContext.Provider
      value={{ transactions, fetchTransactions, createTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}
