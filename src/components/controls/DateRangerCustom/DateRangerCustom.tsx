import clsx from 'clsx';

import styles from './DateRangerCustom.module.scss';
import Moment from 'react-moment';
import {ArrowDown2} from 'iconsax-react';
import {useEffect, useState} from 'react';
import {TippyHeadless} from '../Tippy';
import DateTypeOption from './components/DateTypeOption';
import {getDateRange, getTextDateRange} from '~/common/func/selectDate';
import {useRouter} from 'next/router';
import {timeSubmit} from '~/common/func/optionConvert';
import {PropsDateRangerCustom} from './interfaces';
import {TYPE_DATE} from '~/constants/mocks/enum';

function DateRangerCustom({
	titleTime = 'Thời gian',
	keyTypeDate = 'typeDate',
	keyDateForm = 'dateFrom',
	keyDateTo = 'dateTo',
}: PropsDateRangerCustom) {
	const router = useRouter();

	const {[keyTypeDate]: typeDate, [keyDateForm]: dateForm, [keyDateTo]: dateTo} = router.query;

	const [show, setShow] = useState<boolean>(false);

	const [date, setDate] = useState<{
		from: Date | null;
		to: Date | null;
	} | null>(null);

	useEffect(() => {
		if (Number(typeDate) != TYPE_DATE.LUA_CHON) {
			setDate(() => getDateRange(Number(typeDate))!);
		} else {
			if (!!dateForm && !!dateTo) {
				setDate(() => ({
					from: new Date(dateForm as string),
					to: new Date(timeSubmit(new Date(dateTo as string)) as string),
				}));
			}
		}
	}, [typeDate]);

	useEffect(() => {
		if (date?.from && date?.to) {
			router.replace(
				{
					pathname: router.pathname,
					query: {
						...router.query,
						[keyDateForm]: date?.from ? timeSubmit(date?.from) : '',
						[keyDateTo]: date?.to ? timeSubmit(date?.to, true) : '',
					},
				},
				undefined,
				{scroll: false}
			);
		}
	}, [date?.from, date?.to]);

	return (
		<TippyHeadless
			visible={show}
			onClickOutside={() => setShow(false)}
			position='bottom-start'
			render={() => (
				<DateTypeOption
					date={date}
					setDate={setDate}
					show={show}
					setShow={setShow}
					keyTypeDate={keyTypeDate}
					keyDateForm={keyDateForm}
					keyDateTo={keyDateTo}
				/>
			)}
		>
			<div className={clsx(styles.style2, {[styles.focus]: show})} onClick={() => setShow(!show)}>
				<span className={styles.text_value}>
					{titleTime && `${titleTime}:`}
					{date?.from && date?.to ? (
						<>
							{Number(typeDate) == 8 ? (
								<span className={styles.value}>
									<Moment date={date?.from} format='DD/MM/YYYY' /> - <Moment date={date?.to} format='DD/MM/YYYY' />
								</span>
							) : (
								<span className={styles.value}>{getTextDateRange(Number(typeDate))}</span>
							)}
						</>
					) : (
						<span className={styles.value}>Tất cả</span>
					)}
				</span>
				<div className={clsx(styles.icon_arrow, {[styles.active_icon]: show})}>
					<ArrowDown2 size={18} color='#3F4752' />
				</div>
			</div>
		</TippyHeadless>
	);
}

export default DateRangerCustom;
