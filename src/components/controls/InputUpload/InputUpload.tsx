import {Fragment, memo, useEffect, useState} from 'react';
import {toastError, toastWarn} from '~/common/func/toast';

import Image from 'next/image';
import {IoClose} from 'react-icons/io5';
import {PropsInputUpload} from './interfaces';
import styles from './InputUpload.module.scss';

function InputUpload({data, setData}: PropsInputUpload) {
	const [image, setImage] = useState<string>('');

	const handleSelectImg = (e: any) => {
		const file = e?.target?.files[0];

		if (file) {
			const {size, type} = e.target.files[0];
			const maxSize = 15; //MB

			if (size / 1000000 > maxSize) {
				toastError({msg: `Kích thước tối đa của ảnh là ${maxSize} mb`});
				return;
			} else if (type !== 'image/jpeg' && type !== 'image/jpg' && type !== 'image/png') {
				toastWarn({
					msg: `Định dạng tệp không chính xác, đuôi tệp chấp nhận .jpg, .jpeg, .png`,
				});
				return;
			}

			const imageUrl = URL.createObjectURL(file);
			setData(file);
			setImage((prev: any) => {
				URL.revokeObjectURL(prev);
				return imageUrl;
			});
		}
	};

	useEffect(() => {
		return () => {
			if (image) {
				URL.revokeObjectURL(image);
			}
		};
	}, [image]);

	return (
		<div className={styles.container}>
			{image || data ? (
				<div className={styles.box_image}>
					<div className={styles.containerImage}>
						<div className={styles.imageBase64}>
							<Image src={image ? image : data} alt='file base64' layout='fill' objectFit='contain' />
						</div>
						<div className={styles.groupControl}>
							<div
								className={styles.close}
								onClick={(e) => {
									e.preventDefault();
									setImage('');
									setData(null);
								}}
							>
								<IoClose size={24} />
							</div>
							<label className={styles.changeBtn}>
								<input hidden type='file' onChange={handleSelectImg} onClick={(e: any) => (e.target.value = null)} />
								Thay đổi
							</label>
						</div>
					</div>
				</div>
			) : (
				<label className={styles.box_image}>
					<input hidden type='file' onChange={handleSelectImg} onClick={(e: any) => (e.target.value = null)} />
					<p className={styles.type}>GIF / animated PNG / PNG /JSON</p>
					<p className={styles.size}>Max file size: 10MB</p>
					<p className={styles.text}>Kéo và thả hình ảnh để tải lên</p>
					<span className={styles.or}>Hoặc</span>
					<div className={styles.btn}>Tải lên</div>
				</label>
			)}
		</div>
	);
}

export default memo(InputUpload);
