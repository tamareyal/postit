import { useCallback, useEffect, useRef, useState } from 'react';
import type { AxiosError } from 'axios';

const DEFAULT_PAGE_LIMIT = 10;

export type PaginatedFetchParams = {
	limit: number;
	cursor: string | null;
	queryHash: string | null;
};

export type CursorPageResponse<TItem> = {
	data: TItem[];
	nextCursor: string | null;
	queryHash: string;
};

type UsePaginatedFeedOptions<TItem, TMapped = TItem> = {
	fetchPage: (params: PaginatedFetchParams) => Promise<CursorPageResponse<TItem>>;
	getItemId: (item: TItem) => string;
	mapPageData?: (items: TItem[]) => Promise<TMapped[]> | TMapped[];
	getErrorMessage?: (error: unknown) => string;
	isInvalidQueryHashError?: (error: unknown) => boolean;
	pageLimit?: number;
	refreshTrigger?: number;
};

export type UsePaginatedFeedResult<TMapped> = {
	items: TMapped[];
	nextCursor: string | null;
	hasMore: boolean;
	isInitialLoading: boolean;
	isLoadingMore: boolean;
	error: string | null;
	bottomRef: React.RefObject<HTMLDivElement | null>;
	reload: () => Promise<void>;
};

export function usePaginatedFeed<TItem, TMapped = TItem>({
	fetchPage,
	getItemId,
	mapPageData,
	getErrorMessage,
	isInvalidQueryHashError,
	pageLimit = DEFAULT_PAGE_LIMIT,
	refreshTrigger = 0,
}: UsePaginatedFeedOptions<TItem, TMapped>): UsePaginatedFeedResult<TMapped> {
	const [items, setItems] = useState<TMapped[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const bottomRef = useRef<HTMLDivElement>(null);
	const isFetchingRef = useRef(false);
	const seenIdsRef = useRef(new Set<string>());
	const queryHashRef = useRef<string | null>(null);

	const resetPagingSession = useCallback(() => {
		queryHashRef.current = null;
		seenIdsRef.current.clear();
		setNextCursor(null);
		setHasMore(true);
	}, []);

	const mapItems = useCallback(async (pageItems: TItem[]): Promise<TMapped[]> => {
		if (!mapPageData) return pageItems as unknown as TMapped[];
		return await mapPageData(pageItems);
	}, [mapPageData]);

	const resolveErrorMessage = useCallback((err: unknown) => {
		return getErrorMessage?.(err) ?? 'Failed to load data.';
	}, [getErrorMessage]);

	const isInvalidHash = useCallback((err: unknown) => {
		if (isInvalidQueryHashError) return isInvalidQueryHashError(err);

		const status = (err as AxiosError).response?.status;
		if (status !== 400) return false;

		const message = resolveErrorMessage(err).toLowerCase();
		return message.includes('invalid queryhash');
	}, [isInvalidQueryHashError, resolveErrorMessage]);

	const loadPage = useCallback(async (cursor: string | null, hasRetriedInvalidHash = false) => {
		if (isFetchingRef.current) return;
		isFetchingRef.current = true;

		const isFirstPage = cursor === null;
		if (isFirstPage) {
			setIsInitialLoading(true);
			setError(null);
			resetPagingSession();
		} else {
			setIsLoadingMore(true);
		}

		try {
			const res = await fetchPage({
				limit: pageLimit,
				cursor,
				queryHash: isFirstPage ? null : queryHashRef.current,
			});

			queryHashRef.current = res.queryHash;

			const uniqueItems = res.data.filter((item) => {
				const id = getItemId(item);
				if (seenIdsRef.current.has(id)) return false;
				seenIdsRef.current.add(id);
				return true;
			});

			const mappedItems = await mapItems(uniqueItems);

			if (isFirstPage) {
				setItems(mappedItems);
			} else {
				setItems((prev) => [...prev, ...mappedItems]);
			}

			setNextCursor(res.nextCursor);
			setHasMore(res.nextCursor !== null);
		} catch (err) {
			const status = (err as AxiosError).response?.status;
			const invalidHash = isInvalidHash(err);

			if (invalidHash && !hasRetriedInvalidHash) {
				resetPagingSession();
				isFetchingRef.current = false;
				if (isFirstPage) setIsInitialLoading(false);
				else setIsLoadingMore(false);
				void loadPage(null, true);
				return;
			}

			if (!isFirstPage && status === 400) {
				resetPagingSession();
				isFetchingRef.current = false;
				setIsLoadingMore(false);
				void loadPage(null, hasRetriedInvalidHash);
				return;
			}

			if (isFirstPage) {
				setError(resolveErrorMessage(err));
				setItems([]);
			}

			setHasMore(false);
		} finally {
			isFetchingRef.current = false;
			if (isFirstPage) setIsInitialLoading(false);
			else setIsLoadingMore(false);
		}
	}, [fetchPage, getItemId, isInvalidHash, mapItems, pageLimit, resetPagingSession, resolveErrorMessage]);

	const reload = useCallback(async () => {
		await loadPage(null);
	}, [loadPage]);

	useEffect(() => {
		void loadPage(null);
	}, [loadPage, refreshTrigger]);

	useEffect(() => {
		if (!hasMore || items.length === 0) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isFetchingRef.current) {
					void loadPage(nextCursor);
				}
			},
			{ threshold: 1.0 },
		);

		if (bottomRef.current) observer.observe(bottomRef.current);
		return () => observer.disconnect();
	}, [hasMore, items.length, loadPage, nextCursor]);

	return {
		items,
		nextCursor,
		hasMore,
		isInitialLoading,
		isLoadingMore,
		error,
		bottomRef,
		reload,
	};
}
