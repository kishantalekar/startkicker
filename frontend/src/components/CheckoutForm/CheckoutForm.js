import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { Container, Row, Col, Button } from "react-bootstrap";

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      client_secret: "",
      curPlan: {},
      amount: 0,
      curUser: {},
      display: "none",
      display2: "",
    };
  }

  componentDidMount() {
    const planId = this.props.match.params.planId;
    axios
      .get(`${process.env.REACT_APP_API_URL}/plan/${planId}`, {
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((res) => {
        this.setState({
          curPlan: res.data,
          amount: res.data.price * 100, // amount in paisa for Razorpay
        });
      })
      .catch((err) => {
        process.env.MODE === "dev" && console.log(err);
      });

    this.getcurUser(this.props.curUser);
  }

  getcurUser(curUser) {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/${curUser}`, {
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((res) => {
        this.setState({
          curUser: res.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Meta data : ", this.state.curPlan);
    const userId = this.props.curUser;
    const objectToSend = {
      amount: this.state.amount,
      currency: "INR",
      metadata: { ...this.state.curPlan, userId },
    };

    console.log("Sending payment intent request");
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/pay/createPaymentIntent`,
        objectToSend,
        { headers: { "Access-Control-Allow-Origin": "*" } }
      )
      .then((res) => {
        console.log("Received payment intent response");
        this.handlePayment(res.data);
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  handlePayment = async (order) => {
    console.log(order);
    const options = {
      key: "rzp_test_WHDwkn3KLG9Dqe",
      amount: this.state.amount,
      currency: "INR",
      name: "Your Company Name",
      description: "Test Transaction",
      order_id: order._id,
      handler: (response) => {
        this.handlePaymentSuccess(response);
      },
      prefill: {
        name: "Your Name",
        email: "email@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Your Address",
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", (response) => {
      console.error("Payment failed:", response.error);
    });
  };

  handlePaymentSuccess = (response) => {
    console.log("Payment Success:", response);
    this.setState({
      display: "",
      display2: "none",
    });
  };

  toProfile = (event) => {
    event.preventDefault();
    this.props.history.push(`/profile/${this.props.curUser}`);
  };

  render() {
    return (
      <>
        <Row className="mt-5">
          <Col>
            <form onSubmit={this.handleSubmit}>
              <Container className="p-0">
                <div style={{ display: this.state.display }}>
                  <p>Payment success</p>
                  <Button variant="outline-primary" onClick={this.toProfile}>
                    See All the project you back
                  </Button>
                </div>
                <Button
                  className="mt-4"
                  variant="outline-primary"
                  style={{ display: this.state.display2 }}
                  type="submit"
                >
                  Confirm order
                </Button>
              </Container>
            </form>
          </Col>
        </Row>
      </>
    );
  }
}

const CheckoutFormWithRouter = withRouter(CheckoutForm);

export default CheckoutFormWithRouter;
