import Button from "./Button"

const Persons = ({ persons, onClickDelete}) => {
    
    return  (
        <ul>{persons.map(person => person.visible
             && <li key={person.id}> 
                    {person.name} {person.number} <Button type="submit" onClick={() => onClickDelete(person.id)} name="delete"/>
                </li>)}
        </ul>
    )
}
export default Persons