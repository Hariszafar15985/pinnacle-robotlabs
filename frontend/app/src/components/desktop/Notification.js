import {ReactComponent as NotificationIcon} from "../../images/noti.svg";
import {ReactComponent as CloseIcon} from "../../images/close-outline.svg";
import {useContext} from "react";
import {AppContext} from "../../Provider";

function Notification() {
  const {app} = useContext(AppContext);

  const close = () => {
    app.resetNotification();
  }

  return (
    <div className={'h-full w-full relative notification ' + (app.notification.type === 'warning' ? 'bg-red-500' :
      'bg-yellow-500')}>
      <div className="flex items-center h-full">
        <div className="px-2">
          <NotificationIcon/>
        </div>
        <div className={'pl-2 pr-8 mr-auto ' + (app.notification.type === 'warning' ? 'text-white' :
          'text-black')}>
          <h3 className="font-bold text-sm overflow-hidden">{app.notification.title}</h3>
          <div className="text-xs overflow-hidden">{app.notification.description}</div>
        </div>
        <div className="self-start pr-6 pt-3 cursor-pointer">
          <CloseIcon onClick={close}
                     className={'w-4 ' + (app.notification.type === 'warning' ? 'fill-current text-white' :
                       '')}/>
        </div>
      </div>
    </div>
  );
}

export default Notification;
