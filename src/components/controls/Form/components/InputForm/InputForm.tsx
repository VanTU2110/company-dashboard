import clsx from 'clsx';
import React, {useContext, useEffect, useState} from 'react';
import {RiCheckFill, RiCloseCircleFill, RiEyeLine, RiEyeOffLine} from 'react-icons/ri';

import {ContextForm} from '../../context';
import styles from './InputForm.module.scss';
import {PropsContextForm, PropsInputForm} from './interfaces';
import {convertCoin, price} from '~/common/func/convertCoin';

function InputForm({
	name,
	label,
	iconInput,
	placeholder,
	type = 'text',
	onClean = false,
	showDone = false,
	isRequired = false,
	isNumber = false,
	isDisabled = false,
	textRequired,
	valueConfirm,
	textConfirm,
	isEmail,
	isPhone,
	min,
	max,
	...props
}: PropsInputForm) {
	// Gọi context
	const data = useContext<PropsContextForm>(ContextForm);

	// Chuỗi regex
	const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const regexPhone =
		/^(\+84|84|0)(1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|7[0-9]|8[0-9]|70|56|58|59|9[0-9]|86|88|89)([0-9]{7})$/;

	// Type password
	const isPassword = type === 'password';

	// State input
	const [isFocus, setIsFocus] = useState<boolean>(false);
	const [showPass, setShowPass] = useState<boolean>(false);

	/********** Xử lí khi submit, kiểm tra validate input **********/
	useEffect(() => {
		if (data.countValidate > 0) {
			handleSetMessage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.countValidate]);

	/********** Xử lí khi value input thay đổi, kiểm tra validate input **********/
	useEffect(() => {
		return data.setValidate((prev: any) => ({
			...prev,
			[name]: handleValidate(),
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.form]);

	/********** Kiểm tra thay đổi value confirm **********/
	useEffect(() => {
		if (valueConfirm && data.form[name] !== valueConfirm && data.form[name] !== '') {
			return data.setErrorText((prev: any) => ({
				...prev,
				[name]: textConfirm || 'Mật khẩu không trùng khớp',
			}));
		} else {
			return data.setErrorText((prev: any) => ({
				...prev,
				[name]: null,
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [valueConfirm]);

	// Xử lý ẩn hiện type = password
	const handleToggleShowPass = () => {
		setShowPass(!showPass);
	};

	// Xử lý xóa value input
	const handleClean = () => {
		return data.setForm((prev: any) => ({
			...prev,
			[name]: '',
		}));
	};

	// Xử lý focus
	const handlerFocused = () => {
		setIsFocus(true);
		return data.setErrorText((prev: any) => ({
			...prev,
			[name]: null,
		}));
	};

	// Xử lý lấy value input
	const handleChange = (e: any) => {
		const {value, name} = e.target;

		if (type === 'number' && parseFloat(value) < 0) {
			return data.setForm((prev: any) => ({
				...prev,
				[name]: '0',
			}));
		}

		return data.setForm((prev: any) => ({
			...prev,
			[name]: value,
		}));
	};

	// Xử lý khi blur
	const handlerBlur = () => {
		setIsFocus(false);

		handleSetMessage();
		/********** return validate passed **********/
		return data.setValidate((prev: any) => ({
			...prev,
			[name]: handleValidate(),
		}));
	};

	/********** Check validate **********/
	const handleValidate = () => {
		// Bắt buộc nhập  ===> isRequired
		if ((isRequired && `${data.form[name]}`.trim() === '') || (!data.form[name] && isRequired)) {
			return false;
		}

		// Kiểm tra value == ''
		if (!!data.form[name] && `${data.form[name]}`.trim() !== '') {
			// Kiểm tra value là số
			if (isNumber) {
				const numericValue = Number(data.form[name]);

				if (isNaN(numericValue) || numericValue < 0) {
					return false;
				}
			}

			// Kiểm tra value confirm = data.form[name]
			if (valueConfirm && data.form[name] !== valueConfirm) {
				return false;
			}

			// Kiểm tra email
			if (isEmail && !regexEmail.test(data.form[name])) {
				return false;
			}

			// Kiểm tra số điện thoại
			if (isPhone && !regexPhone.test(data.form[name])) {
				return false;
			}

			// Kiểm tra min max
			if (min && `${data.form[name]}`.trim().length < min) {
				return false;
			}

			if (max && `${data.form[name]}`.trim().length > max) {
				return false;
			}
		}

		return true;
	};

	/********** Hiển thị message thông báo validate **********/
	const handleSetMessage = () => {
		// Mặc định chưa có lỗi
		data.setErrorText((prev: any) => ({
			...prev,
			[name]: null,
		}));

		// Bắt buộc nhập  ===> isRequired
		if ((isRequired && `${data.form[name]}`.trim() === '') || (!data.form[name] && isRequired)) {
			return data.setErrorText((prev: any) => ({
				...prev,
				[name]: textRequired || 'Vui lòng nhập trường này',
			}));
		}

		// Kiểm tra value == ''
		if (!!data.form[name] && `${data.form[name]}`.trim() !== '') {
			// Kiểm tra value là số
			if (isNumber) {
				if (!Number(data.form[name]) && Number(data.form[name]) != 0) {
					return data.setErrorText((prev: any) => ({
						...prev,
						[name]: 'Vui lòng chỉ nhập số',
					}));
				}
			}

			// Kiểm tra value confirm = data.form[name]
			if (valueConfirm && data.form[name] !== valueConfirm) {
				return data.setErrorText((prev: any) => ({
					...prev,
					[name]: textConfirm || 'Mật khẩu và xác nhận mật khẩu không trùng nhau',
				}));
			}

			// Kiểm tra email
			if (isEmail && !regexEmail.test(data.form[name])) {
				return data.setErrorText((prev: any) => ({
					...prev,
					[name]: 'Địa chỉ email không hợp lệ',
				}));
			}

			// Kiểm tra số điện thoại
			if (isPhone && !regexPhone.test(data.form[name])) {
				return data.setErrorText((prev: any) => ({
					...prev,
					[name]: 'Số điện thoại không hợp lệ',
				}));
			}

			// Kiểm tra min max
			if (min && `${data.form[name]}`.trim().length < min) {
				return data.setErrorText((prev: any) => ({
					...prev,
					[name]: `Nhập tối thiểu ${min} kí tự`,
				}));
			}

			if (max && `${data.form[name]}`.trim().length > max) {
				return data.setErrorText((prev: any) => ({
					...prev,
					[name]: `Nhập tối đa ${max} kí tự`,
				}));
			}
		}
	};

	return (
		<div className={clsx(styles.container)}>
			{/* Element lable  */}
			{label && (
				<label className={styles.label}>
					{label} {isRequired && <span style={{color: 'red'}}>*</span>}
				</label>
			)}
			<div
				className={clsx(styles.group, {
					[styles.iconGroup]: iconInput,
					[styles.focus]: isFocus,
					[styles.done]: data.isDone && showDone,
					[styles.error]: data?.errorText[name] !== null,
					[styles.disabled]: isDisabled,
				})}
			>
				{iconInput && <div className={styles.icon}>{iconInput}</div>}
				<div className={styles.inputGroup}>
					<input
						{...props}
						name={name}
						autoComplete='off'
						value={data.form[name] || ''}
						type={showPass ? 'text' : type}
						className={styles.inputElement}
						placeholder={placeholder}
						onFocus={handlerFocused}
						onChange={handleChange}
						onBlur={handlerBlur}
						disabled={isDisabled}
					/>

					{/* Icon type password */}
					{isPassword ? (
						<span className={styles.iconHandle} onClick={handleToggleShowPass}>
							{showPass ? <RiEyeLine /> : <RiEyeOffLine />}
						</span>
					) : null}

					{/* Icon clear */}
					{onClean && !!data.form[name] && !isDisabled ? (
						<span className={styles.iconHandle} onClick={handleClean}>
							<RiCloseCircleFill color='#5e6167' />
						</span>
					) : null}

					{/* Icon isDone */}
					{data.isDone && !isDisabled ? (
						<span className={styles.iconHandle}>
							<RiCheckFill color='#83BF6E' />
						</span>
					) : null}
					{/* {data.isDone && !isPassword && onClean && !isDisabled ? (
						<span className={styles.iconHandle}>
							<RiCheckFill color='#83BF6E' />
						</span>
					) : null} */}
				</div>
			</div>
			<p className={styles.errorText}>{data?.errorText[name]}</p>
		</div>
	);
}

export default InputForm;
