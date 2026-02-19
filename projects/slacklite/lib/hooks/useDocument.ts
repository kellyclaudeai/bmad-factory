"use client";

import { useEffect, useState } from "react";
import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";

export interface UseDocumentResult<TDocument extends DocumentData> {
  data: TDocument | null;
  loading: boolean;
  error: Error | null;
}

export function useDocument<TDocument extends DocumentData>(
  documentRef: DocumentReference<TDocument> | null | undefined,
): UseDocumentResult<TDocument> {
  const [data, setData] = useState<TDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentRef) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setData(null);
    setError(null);
    setLoading(true);

    const unsubscribe = onSnapshot(
      documentRef,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [documentRef]);

  return {
    data,
    loading,
    error,
  };
}

export default useDocument;
