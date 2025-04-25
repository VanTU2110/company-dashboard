import {memo, useEffect, useState} from 'react';

import Calendar from './components/Calendar';
import HeadlessTippy from '@tippyjs/react/headless';
import {Calendar as IconCalendar} from 'iconsax-react';
import {PropsDatePicker} from './interface';
import clsx from 'clsx';
import convertDate from '~/common/func/convertDate';
import styles from './DatePicker.module.scss';

function DatePicker({
	placeholder,
	onSetValue,
	value,
	icon,
	className,
	blockOldDay,
	futureDayblock,
}: PropsDatePicker) {
	const [show, setShow] = useState<boolean>(false);

	const handleClickDay = (time: number) => {
		setShow(false);
		onSetValue(new Date(time));
	};

	return (
		<HeadlessTippy
			interactive
			visible={show}
			placement='bottom'
			render={(attrs) => (
				<Calendar
					onClickDay={handleClickDay}
					show={show}
					blockOldDay={blockOldDay}
					futureDayblock={futureDayblock}
				/>
			)}
			onClickOutside={() => setShow(false)}
		>
			<div
				className={clsx(styles.calendar, className)}
				onClick={() => setShow(!show)}
			>
				{icon && <IconCalendar color='#303C4F' size='20' />}
				<div className={styles.value}>
					{value ? convertDate(value).getDateFormat() : placeholder}
				</div>
			</div>
		</HeadlessTippy>
	);
}

export default memo(DatePicker);
