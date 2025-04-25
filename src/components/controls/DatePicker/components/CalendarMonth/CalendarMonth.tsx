import {ArrowLeft2, ArrowRight2, Calendar as IconCalendar} from 'iconsax-react';
import {useEffect, useState} from 'react';

import HeadlessTippy from '@tippyjs/react/headless';
import clsx from 'clsx';
import convertDate from '~/common/func/convertDate';
import styles from './CalendarMonth.module.scss';

function CalendarMonth({
	placeholder,
	onSetValue,
	value,
	icon,
	disableReset,
}: any) {
	const [show, setShow] = useState<boolean>(false);

	return (
		<HeadlessTippy
			interactive
			visible={show}
			placement='bottom'
			render={(attrs: any) => (
				<MainCalendar
					onSetValue={onSetValue}
					value={value}
					onClose={() => setShow(false)}
					disableReset={disableReset}
				/>
			)}
			onClickOutside={() => setShow(false)}
		>
			<div className={styles.calendar} onClick={() => setShow(!show)}>
				{icon && <IconCalendar size='20' />}
				<div className={styles.value}>
					{value ? convertDate(value).getDateFormat() : placeholder}
				</div>
			</div>
		</HeadlessTippy>
	);
}

const MainCalendar = ({
	onSetValue,
	onClose,
	value,
	disableReset,
}: {
	onSetValue: (value: any) => void;
	onClose: () => void;
	value: Date;
	disableReset?: boolean;
}) => {
	const [active, setActive] = useState<boolean>(false);

	const [year, setYear] = useState<number>(
		value ? value.getFullYear() : new Date().getFullYear()
	);
	const [month, setMonth] = useState<number | null>(
		value ? value.getMonth() + 1 : value
	);

	const months: Array<string> = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	const prevYear = () => {
		setYear((prev) => prev - 1);
	};

	const nextYear = () => {
		setYear((prev) => prev + 1);
	};

	useEffect(() => {
		if (active) {
			onSetValue(() => new Date(`${year}/${month}/01`));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [year, month, active]);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.btnYear} onClick={prevYear}>
					<ArrowLeft2 size='32' variant='Bold' />
				</div>
				<div>{year}</div>
				<div className={styles.btnYear} onClick={nextYear}>
					<ArrowRight2 size='32' variant='Bold' />
				</div>
			</div>
			<div className={styles.body}>
				{months.map((v, i) => (
					<div key={i} className={styles.itemMain}>
						<div
							className={clsx(styles.item, {
								[styles.active]: month === i + 1,
							})}
							onClick={() => {
								setActive(true);
								setMonth(i + 1);
								onClose();
							}}
						>
							{v}
						</div>
					</div>
				))}
			</div>
			{!disableReset && (
				<div
					className={styles.btnClose}
					onClick={() => {
						setActive(false);
						onSetValue(null);
						onClose();
						setMonth(null);
					}}
				>
					Đặt lại
				</div>
			)}
		</div>
	);
};

export default CalendarMonth;
