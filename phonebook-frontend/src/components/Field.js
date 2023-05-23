const Field = (props) => {
    return (
        <div>
            {props.name}: <input value={props.value} onChange={props.onChange}/>
        </div>
    )
}

export default Field