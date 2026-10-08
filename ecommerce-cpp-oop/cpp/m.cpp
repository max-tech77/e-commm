#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Product {
protected:
    int id;
    string name;
    int price;

public:
    Product(int i, string n, int p) {
        id = i;
        name = n;
        price = p;
    }

    virtual string display() {
        return to_string(id) + ". " + name + " - Rs " + to_string(price);
    }

    int getId()      { return id; }
    string getName() { return name; }
    int getPrice()   { return price; }

    virtual ~Product() {}
};

class Electronics : public Product {
    int warrantyMonths;

public:
    Electronics(int i, string n, int p, int w) : Product(i, n, p) {
        warrantyMonths = w;
    }

    string display() override {
        return "[Electronics] " + Product::display() +
               " (Warranty: " + to_string(warrantyMonths) + " months)";
    }
};


class Clothing : public Product {
    string size;

public:
    Clothing(int i, string n, int p, string s) : Product(i, n, p) {
        size = s;
    }

    string display() override {
        return "[Clothing] " + Product::display() + " (Size: " + size + ")";
    }
};


class Customer {
private:
    string name;
    string phone;

public:
    Customer(string n, string p) {
        name = n;
        phone = p;
    }

    string getName()  { return name; }
    string getPhone() { return phone; }
};


class Cart {
private:
    vector<Product*> items;     
    vector<int> quantities;     
public:
    void addToCart(Product* p, int qty) {
        for (size_t i = 0; i < items.size(); i++) {
            if (items[i]->getId() == p->getId()) {
                quantities[i] += qty;
                return;
            }
        }
        items.push_back(p);
        quantities.push_back(qty);
    }

    bool isEmpty() {
        return items.empty();
    }

    int calculateTotal() {
        int total = 0;
        for (size_t i = 0; i < items.size(); i++) {
            total += items[i]->getPrice() * quantities[i];
        }
        return total;
    }

    void viewCart() {
        if (items.empty()) {
            cout << "Your cart is empty." << endl;
            return;
        }
        for (size_t i = 0; i < items.size(); i++) {
            cout << items[i]->getName() << " x " << quantities[i]
                 << " = Rs " << items[i]->getPrice() * quantities[i] << endl;
        }
        cout << "Total: Rs " << calculateTotal() << endl;
    }

    string generateBill(Customer& c) {
        string bill = "======== BILL ========\n";
        bill += "Customer: " + c.getName() + "\n";
        bill += "Phone: " + c.getPhone() + "\n";
        bill += "----------------------\n";
        for (size_t i = 0; i < items.size(); i++) {
            bill += items[i]->getName() + " x " + to_string(quantities[i]) +
                    " = Rs " + to_string(items[i]->getPrice() * quantities[i]) + "\n";
        }
        bill += "----------------------\n";
        bill += "TOTAL: Rs " + to_string(calculateTotal()) + "\n";
        bill += "======================\n";
        return bill;
    }
};

int main() {
    Product* products[5];
    products[0] = new Electronics(1, "Smartphone", 15999, 12);
    products[1] = new Electronics(2, "Headphones", 1999, 6);
    products[2] = new Clothing(3, "T-Shirt", 799, "M");
    products[3] = new Clothing(4, "Jeans", 1499, "L");
    products[4] = new Electronics(5, "Keyboard", 999, 12);

    Cart cart;
    int choice = 0;

    while (choice != 5) {
        cout << "\n=== E-COMMERCE SHOPPING SYSTEM ===" << endl;
        cout << "1. View products" << endl;
        cout << "2. Add to cart" << endl;
        cout << "3. View cart" << endl;
        cout << "4. Checkout (generate bill)" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1) {
            for (int i = 0; i < 5; i++) {
                cout << products[i]->display() << endl;
            }
        }
        else if (choice == 2) {
            int id, qty;
            cout << "Enter product ID (1-5): ";
            cin >> id;
            cout << "Enter quantity: ";
            cin >> qty;
            if (id >= 1 && id <= 5 && qty > 0) {
                cart.addToCart(products[id - 1], qty);
                cout << "Added to cart!" << endl;
            } else {
                cout << "Invalid product ID or quantity." << endl;
            }
        }
        else if (choice == 3) {
            cart.viewCart();
        }
        else if (choice == 4) {
            if (cart.isEmpty()) {
                cout << "Cart is empty. Add something first." << endl;
            } else {
                string name, phone;
                cin.ignore();   // clears the leftover Enter key
                cout << "Enter your name: ";
                getline(cin, name);
                cout << "Enter your phone: ";
                getline(cin, phone);
                Customer c(name, phone);
                cout << endl << cart.generateBill(c);
            }
        }
    }

    for (int i = 0; i < 5; i++) {
        delete products[i];
    }
    cout << "Thank You for shopping!" << endl;
    return 0;
}
