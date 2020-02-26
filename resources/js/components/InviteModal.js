/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import {
  Row, Col,
  Modal, ModalBody, ModalHeader,
	Button
} from 'reactstrap';
import {Checkbox} from 'semantic-ui-react';

class InviteModal extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
					isOpen: true,
					is_super: false
				}
				
				this.handleCancel = this.handleCancel.bind(this);
    }

		handleCancel() {
			let {
				handleCancel
			} = this.props;
	
			handleCancel = handleCancel || (() => {});
			handleCancel();
		}

		handleChangeSuper() {
			this.setState({
				is_super: !this.state.is_super
			});
		}

		handleSendBtn() {
			let {
        handleSend
      } = this.props;
      
      handleSend = handleSend || (() => {});

      handleSend(this.state.is_super);
    }

		render() {
			const {
				isOpen
			} = this.state;

			return (
				<Modal
					isOpen={isOpen}
					toggle={this.handleCancel}
					onClosed={this.handleCancel}
					className="modal-edit-item"
					centered={true}
				>
					<ModalHeader toggle={this.handleCancel} style={{ borderBottom: 'none' }} />
					<ModalBody>
						<Row>
							<Col sm="12">
								<h5 className="text-center">
									Your invitation will be sent to <span className="text-danger">{this.props.email}</span> now.
								</h5>
							</Col>
							<Col sm="10" className="mt-3">
								<h5>
									Do you want to make this account with super permission?
								</h5>
								
							</Col>
							<Col sm="2" className="mt-3">
								<div className="ui fitted toggle checkbox">
									<Checkbox 
										name="is_super"
										className="hidden"
										onChange={this.handleChangeSuper.bind(this)} />
								</div>
							</Col>
							<Col sm="12"
								className="offset-sm-5 mt-5"
							>
								<Button
                  type="button"
                  color="success"
                  onClick={this.handleSendBtn.bind(this)}
                >
									Send
								</Button>
							</Col>
						</Row>
					</ModalBody>
				</Modal>
			)
		}
}

export default InviteModal;