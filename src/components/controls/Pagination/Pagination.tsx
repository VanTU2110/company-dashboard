import {memo, useMemo} from 'react';
import clsx from 'clsx';
import style from './Pagination.module.scss';
import {ArrowLeft2, ArrowRight2} from 'iconsax-react';

interface props {
	pageSize: number;
	pageCurrent: number;
	totalItem: number;
	onSetPage: (page: number) => void;
	onSetPageSize: (page: number) => void;
	textResult: string;
}

function Pagination({
	pageSize,
	pageCurrent,
	totalItem,
	onSetPage,
	onSetPageSize,
	textResult = 'kết quả',
}: props) {
	const totalPage: number = useMemo(() => {
		return Math.ceil(totalItem / pageSize);
	}, [pageSize, totalItem]);

	function prev() {
		if (pageCurrent > 1) {
			onSetPage(pageCurrent - 1);
		}
	}
	function next() {
		if (pageCurrent < totalPage) {
			onSetPage(pageCurrent + 1);
		}
	}

	return (
		<div className={style.tfoot}>
			<div className={clsx(style.limit_info, style.expan)}>
				<div className={style.limit}>
					<span>Hiển thị:</span>
					<select
						onChange={(e: any) => {
							onSetPage(1);
							onSetPageSize(e.target.value);
						}}
						defaultValue={pageSize}
					>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={30}>30</option>
						<option value={50}>50</option>
					</select>
				</div>
				<div className={clsx(style.info, style.expan)}>
					<span>
						<b>{pageSize * (pageCurrent - 1) + 1}</b>
						<span style={{margin: '0 2px'}}>-</span>
						<b style={{marginRight: '3px'}}>
							{pageSize * pageCurrent}
						</b>
						Trong tổng số{' '}
						<b style={{margin: '0 2px'}}>{totalItem}</b>{' '}
						{textResult}
					</span>
				</div>
			</div>
			<div className={style.pagination}>
				<span>
					Tổng số trang: <b>{totalPage}</b>
				</span>
				<div className={style.groupControls}>
					<div className={style.prev_next}>
						<div
							className={clsx(
								style.prev,
								pageCurrent > 1 ? style.active : ''
							)}
							onClick={prev}
						>
							<ArrowLeft2 size={16} />
						</div>
						<div className={style.page}>{pageCurrent}</div>
						<div
							className={clsx(
								style.next,
								pageCurrent < totalPage ? style.active : ''
							)}
							onClick={next}
						>
							<ArrowRight2 size={16} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(Pagination);
