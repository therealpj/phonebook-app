import '../stylesheets/notification.css'

const Notification = ({ type, message}) => {
    return message === null ? <></> 
    : (<div className={type}>
            {message}
        </div>)
}

export default Notification