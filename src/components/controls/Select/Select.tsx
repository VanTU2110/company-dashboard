import {createContext, useEffect, useRef, useState} from 'react';

import {PropsSelector} from './interfaces';
import clsx from 'clsx';
import styles from './Select.module.scss';

export const ContextSelect = createContext<any>({});

function Select(props: PropsSelector) {
	const ref = useRef<any>(null);
	const [show, setShow] = useState<boolean>(false);
	const [value, setValue] = useState<any>(null);
	const [keyword, setKeyword] = useState<string>('');

	const handleChange = (data: any) => {
		const e = {
			target: {
				name: props?.name,
				textname: props?.textname,
				value: data?.value,
				title: data?.title,
			},
		};

		props.onChange && props.onChange(e);
		setValue(data);
	};

	useEffect(() => {
		const handleClick = (e: any) => {
			if (ref.current && !ref.current.contains(e.target)) {
				setShow(false);
			}
		};
		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	}, [ref]);

	return (
		<ContextSelect.Provider
			value={{
				onChange: handleChange,
				data: value,
				defaultValue: props?.value,
				keyword,
			}}
		>
			<div className={styles.container}>
				{props.label && (
					<label className={styles.label}>
						{props.label} {props.isRequired && <span style={{color: 'red'}}>*</span>}
					</label>
				)}
				<div className={clsx(styles.select)} ref={ref}>
					<div className={clsx(styles.value, {[styles.active]: show})} onClick={() => setShow(!show)}>
						<p
							className={clsx(styles.text, {
								[styles.placeholder]: !props.value,
							})}
						>
							{props.value ? value?.title : props.placeholder}
						</p>
						<span className={styles.icon}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
							>
								<path
									stroke='currentColor'
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeMiterlimit='10'
									strokeWidth='1.5'
									d='M19.92 8.95l-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95'
								></path>
							</svg>
						</span>
					</div>
					<div
						className={clsx(styles.containerOption, {
							[styles.active]: show,
						})}
					>
						{props.isSearch && (
							<div>
								<input
									className={styles.input_search}
									type='text'
									placeholder='Tìm kiếm...'
									onChange={(e) => setKeyword(e.target.value)}
									value={keyword}
								/>
							</div>
						)}
						<div className={styles.overflow} onClick={() => setShow(false)}>
							{props.children}
						</div>
					</div>
				</div>
			</div>
		</ContextSelect.Provider>
	);
}

export default Select;
