import Button from "../Button";
import { PiWarningCircleBold } from "react-icons/pi";
import Popup from "~/components/common/Popup";
import { PropsDialog } from "./interfaces";
import clsx from "clsx";
import styles from "./Dialog.module.scss";
import { useStyleClass } from "~/common/hooks/usStyleClass";

function Dialog({
  titleSubmit = "Xác nhận",
  titleCancel = "Hủy bỏ",
  Icon,
  className,
  ...props
}: PropsDialog) {
  const styleClass = useStyleClass(props, styles);
  return (
    <Popup open={props.open} onClose={props.onClose}>
      <div className={clsx("effectZoom", styles.popup, styleClass)}>
        <div className={styles.iconWarn}>
          {Icon ? Icon : <PiWarningCircleBold />}
        </div>
        <h4 className={styles.titlePopup}>{props.title}</h4>
        <p className={styles.note}>{props?.note}</p>
        <div className={styles.groupBtnPopup}>
          <Button
            className="click"
            grey_2
            rounded_8
            bold
            onClick={props.onClose}
            maxContent
            small
          >
            {titleCancel}
          </Button>
          <Button
            className="click"
            primary
            bold
            rounded_8
            onClick={props.onSubmit}
            maxContent
            small
            {...props}
          >
            {titleSubmit}
          </Button>
        </div>
      </div>
    </Popup>
  );
}

export default Dialog;
