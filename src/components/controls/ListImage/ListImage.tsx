import {Fragment, useMemo} from 'react';

import LightGallery from 'lightgallery/react';
import {PropsListImage} from './interfaces';
import lgZoom from 'lightgallery/plugins/zoom';
import styles from './ListImage.module.scss';
import ImageWithFallback from '~/components/common/ImageWithFallback';

function ListImage({
	images = [],
	width = 42,
	height = 42,
	borderRadius = 8,
	max = 4,
}: PropsListImage) {
	const countImage = useMemo(() => images.length, [images]);

	return (
		<Fragment>
			<LightGallery
				elementClassNames={styles.container}
				speed={500}
				plugins={[lgZoom]}
			>
				{images?.map((v, i) => (
					<a
						hidden={i >= max}
						className={styles.item_image}
						key={i}
						href={v}
						style={{
							width: `${width}px`,
							height: `${height}px`,
							borderRadius: `${borderRadius}px`,
						}}
					>
						<ImageWithFallback
							className={styles.image_sick}
							src={v}
							alt='Ảnh phản hồi khách hàng'
							layout='fill'
						/>
						{i + 1 == max && countImage > max ? (
							<div className={styles.count}>
								+{countImage - max}
							</div>
						) : null}
					</a>
				))}
			</LightGallery>
		</Fragment>
	);
}

export default ListImage;
