import { Alert } from "react-bootstrap";

export default function MessageAlert(props) {
    return (
      <Alert show={props.show} variant={props.variant} onClose={props.close} dismissible>
        <Alert.Heading>{props.title}</Alert.Heading>
        <p>
          {props.message}
        </p>
      </Alert>
    )
}